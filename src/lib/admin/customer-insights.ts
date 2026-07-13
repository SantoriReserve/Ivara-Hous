import { daysSince } from "@/lib/admin/customer-health";
import type { AdminActivityTimelineEvent } from "@/lib/admin/admin-types";
import type { AssessmentRecord } from "@/lib/assessment-schema";
import type { EmailDeliveryRecord } from "@/lib/email/email-delivery-repository";

const EMAIL_TYPE_LABELS: Record<string, string> = {
  account_access_setup: "Password Setup",
  password_reset: "Password Reset",
  purchase_complete: "Purchase Confirmation",
  plan_pdf: "Plan PDF Delivery",
  purchase_welcome: "Welcome Email",
  customer_notification: "Customer Notification",
  owner_purchase: "Owner Purchase Alert",
};

export function labelEmailType(emailType: string): string {
  return EMAIL_TYPE_LABELS[emailType] ?? emailType.replace(/_/g, " ");
}

const EMPTY_INSIGHTS = {
  overallScore: null as number | null,
  topStrengths: [] as string[],
  improvementAreas: [] as string[],
  recommendedFocus: [] as string[],
  recommendedResources: [] as string[],
  currentStage: null as string | null,
  nextAction: null as string | null,
};

export function buildAssessmentInsights(assessment: AssessmentRecord | null): {
  overallScore: number | null;
  topStrengths: string[];
  improvementAreas: string[];
  recommendedFocus: string[];
  recommendedResources: string[];
  currentStage: string | null;
  nextAction: string | null;
} {
  if (!assessment?.analysis) {
    return { ...EMPTY_INSIGHTS };
  }

  try {
    const analysis = assessment.analysis;
    const scores = analysis.scores ?? null;
    const preview = analysis.preview ?? null;
    const developmentFoundation = analysis.developmentFoundation ?? null;
    const foundation = analysis.foundation ?? null;

    const entries = scores
      ? (Object.entries(scores) as Array<[string, number]>).filter(
          ([, value]) => typeof value === "number"
        )
      : [];
    const overallScore = entries.length
      ? Math.round(entries.reduce((sum, [, value]) => sum + value, 0) / entries.length)
      : null;
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const topStrengths =
      preview?.topStrengths?.length
        ? preview.topStrengths
        : sorted.slice(0, 3).map(([key, value]) => `${key} (${value})`);
    const improvementAreas =
      preview?.growthOpportunities?.length
        ? preview.growthOpportunities
        : sorted
            .slice(-3)
            .reverse()
            .map(([key, value]) => `${key} (${value})`);

    const recommendedFocus =
      preview?.priorityFocusAreas?.length
        ? preview.priorityFocusAreas
        : developmentFoundation?.priorityFocusAreas ?? [];

    const recommendedResources = [
      ...(foundation?.contentPillars?.slice(0, 2) ?? []),
      developmentFoundation?.portfolioDevelopmentPriority,
    ].filter((value): value is string => Boolean(value));

    return {
      overallScore,
      topStrengths,
      improvementAreas,
      recommendedFocus,
      recommendedResources,
      currentStage:
        preview?.currentCreatorStage || developmentFoundation?.creatorStage || null,
      nextAction: preview?.recommendedNextStep || null,
    };
  } catch (error) {
    console.error("[admin] buildAssessmentInsights failed:", error);
    return { ...EMPTY_INSIGHTS };
  }
}

export function resolveNextRecommendedAction(params: {
  lifecycleStatus: string;
  health: string;
  currentDay: number | null;
  progressPercent: number | null;
  assessmentNextStep: string | null;
  lastLogin: string | null;
}): string {
  if (params.lifecycleStatus === "completed") {
    return "Invite to Creator Roster / request a testimonial";
  }
  if (params.health === "at_risk") {
    return "Send a personal check-in and resend password access if needed";
  }
  if (params.health === "needs_attention") {
    return "Send a gentle progress reminder for their current day";
  }
  if (!params.lastLogin) {
    return "Resend password setup / welcome email to drive first login";
  }
  if ((params.progressPercent ?? 0) < 5) {
    return "Encourage Day 1 completion and profile optimization";
  }
  if (params.currentDay != null) {
    return `Continue Day ${params.currentDay} tasks in the dashboard`;
  }
  return params.assessmentNextStep || "Review plan progress and encourage next task";
}

export function enrichCustomerJourney(params: {
  purchaseDate: string | null;
  assessment: AssessmentRecord | null;
  emails: EmailDeliveryRecord[];
  lastLogin: string | null;
  authCreatedAt: string | null;
  currentDay: number | null;
  planCompletedAt: string | null;
  completionEvents: AdminActivityTimelineEvent[];
  lastActiveAt: string | null;
}): AdminActivityTimelineEvent[] {
  const events: AdminActivityTimelineEvent[] = [];

  if (params.assessment) {
    events.push({
      id: `assessment-completed-${params.assessment.assessmentId}`,
      occurredAt: params.assessment.submittedAt,
      label: "Assessment Completed",
      detail: params.assessment.analysis?.preview?.creatorArchetype,
    });
  }

  if (params.purchaseDate) {
    events.push({
      id: `purchased-${params.purchaseDate}`,
      occurredAt: params.purchaseDate,
      label: "Purchased Creator Development Plan",
    });
  }

  for (const email of params.emails) {
    events.push({
      id: `email-${email.id}`,
      occurredAt: email.createdAt,
      label: `${labelEmailType(email.emailType)} ${email.status === "sent" ? "Sent" : "Failed"}`,
      detail: email.status,
    });
  }

  if (params.authCreatedAt) {
    events.push({
      id: `password-created-${params.authCreatedAt}`,
      occurredAt: params.authCreatedAt,
      label: "Password Created",
      detail: "Auth account provisioned",
    });
  }

  if (params.lastLogin) {
    events.push({
      id: `first-or-last-login-${params.lastLogin}`,
      occurredAt: params.lastLogin,
      label: "Logged In",
    });
  }

  if (params.currentDay != null && params.currentDay >= 1 && params.lastActiveAt) {
    events.push({
      id: `day-progress-${params.currentDay}`,
      occurredAt: params.lastActiveAt,
      label: `Reached Day ${params.currentDay}`,
    });
  }

  if (params.planCompletedAt) {
    events.push({
      id: `program-completed-${params.planCompletedAt}`,
      occurredAt: params.planCompletedAt,
      label: "Completed Program",
    });
  }

  const inactive = daysSince(params.lastActiveAt ?? params.lastLogin);
  if (inactive != null && inactive >= 5 && params.lastActiveAt) {
    events.push({
      id: `returned-signal-${params.lastActiveAt}`,
      occurredAt: params.lastActiveAt,
      label: `Active after ${inactive} day gap (latest activity)`,
    });
  }

  events.push(...params.completionEvents);

  return events.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

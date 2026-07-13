import { NextResponse } from "next/server";
import {
  getAdminActivityMetrics,
  getAdminAssessmentById,
  getAdminAssessments,
  getAdminConversionMetrics,
  getAdminCustomerDetail,
  getAdminCustomers,
  getAdminEmailDeliveries,
  getAdminEmailStats,
  getAdminNotifications,
  getAdminOverviewMetrics,
  getAdminPlanAnalytics,
  getAdminRevenueMetrics,
  getAdminTrendAnalytics,
} from "@/lib/admin/admin-repository";
import {
  getAdminContactInquiries,
  getAdminCreatorApplications,
  getAdminPartnerInquiries,
} from "@/lib/admin/crm-repository";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/admin/admin-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function fail(label: string, error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error));
  return {
    ok: false as const,
    label,
    error: `${err.name}: ${err.message}`,
    stack: err.stack ?? null,
  };
}

function ok(label: string, ms: number, detail?: string) {
  return { ok: true as const, label, ms, detail: detail ?? null, error: null, stack: null };
}

function runFormatters(label: string, fn: () => void) {
  const started = Date.now();
  try {
    fn();
    return ok(label, Date.now() - started);
  } catch (error) {
    return fail(label, error);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if ((searchParams.get("code") ?? "") !== (process.env.ADMIN_ACCESS_CODE ?? "4488")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: Array<ReturnType<typeof ok> | ReturnType<typeof fail>> = [];

  async function page(label: string, fn: () => Promise<void>) {
    const started = Date.now();
    try {
      await fn();
      results.push(ok(label, Date.now() - started));
    } catch (error) {
      results.push(fail(label, error));
    }
  }

  await page("page:/admin", async () => {
    const [metrics, notifications] = await Promise.all([
      getAdminOverviewMetrics({ includeTestData: true }),
      getAdminNotifications({ includeTestData: true }),
    ]);
    formatCurrency(metrics.totalRevenueCents);
    formatPercent(metrics.assessmentToPurchaseRate, 1);
    metrics.averageCurrentDay.toFixed(1);
    for (const item of notifications) {
      formatDateTime(item.occurredAt);
    }
  });

  await page("page:/admin/customers", async () => {
    const customers = await getAdminCustomers({ includeTestData: true });
    for (const row of customers) {
      formatDate(row.purchaseDate);
      formatDateTime(row.lastActiveAt);
      if (row.amountPaidCents != null) formatCurrency(row.amountPaidCents);
      if (row.progressPercent != null) formatPercent(row.progressPercent, 0);
    }
  });

  await page("page:/admin/revenue", async () => {
    const metrics = await getAdminRevenueMetrics({ includeTestData: true });
    formatCurrency(metrics.revenueAllTimeCents);
    formatCurrency(metrics.averageOrderValueCents);
  });

  await page("page:/admin/conversion", async () => {
    const metrics = await getAdminConversionMetrics({ includeTestData: true });
    formatPercent(metrics.overallFunnelRate, 1);
  });

  await page("page:/admin/analytics", async () => {
    const analytics = await getAdminTrendAnalytics({ includeTestData: true });
    formatPercent(analytics.averageCompletionRate, 1);
    if (analytics.averageDaysToFinish != null) analytics.averageDaysToFinish.toFixed(1);
  });

  await page("page:/admin/emails", async () => {
    const [deliveries, stats] = await Promise.all([
      getAdminEmailDeliveries({ includeTestData: true, limit: 500 }),
      getAdminEmailStats({ includeTestData: true }),
    ]);
    for (const row of deliveries) formatDateTime(row.createdAt);
    formatPercent(stats.totalSent, 0);
  });

  await page("page:/admin/assessments", async () => {
    const assessments = await getAdminAssessments({ includeTestData: true });
    for (const row of assessments) formatDate(row.submittedAt);
  });

  await page("page:/admin/plans", async () => {
    const analytics = await getAdminPlanAnalytics({ includeTestData: true });
    analytics.averageCurrentDay.toFixed(1);
    formatPercent(analytics.averageCompletion, 1);
  });

  await page("page:/admin/activity", async () => {
    const activity = await getAdminActivityMetrics({ includeTestData: true });
    for (const row of activity.recentlyCompleted) {
      formatDate(row.completedAt);
      formatPercent(row.progressPercent, 0);
    }
  });

  await page("page:/admin/creator-crm", async () => {
    const rows = await getAdminCreatorApplications({ includeTestData: true });
    for (const row of rows) formatDate(row.submittedAt);
  });

  await page("page:/admin/partner-crm", async () => {
    const rows = await getAdminPartnerInquiries({ includeTestData: true });
    for (const row of rows) formatDate(row.submittedAt);
  });

  await page("page:/admin/contact-inquiries", async () => {
    const rows = await getAdminContactInquiries({ includeTestData: true });
    for (const row of rows) formatDate(row.submittedAt);
  });

  const customers = await getAdminCustomers({ includeTestData: true });
  for (const customer of customers) {
    await page(`page:/admin/customers/${customer.customerKey}`, async () => {
      const detail = await getAdminCustomerDetail(customer.customerKey, {
        includeTestData: true,
      });
      if (!detail) {
        throw new Error("Customer detail returned null");
      }
      formatDate(detail.joinDate);
      formatDate(detail.purchaseDate);
      formatDateTime(detail.lastLogin);
      formatDateTime(detail.lastDashboardActivity);
      formatCurrency(detail.totalRevenueCents);
      if (detail.amountPaidCents != null) formatCurrency(detail.amountPaidCents);
      for (const purchase of detail.allPurchases) {
        formatDate(purchase.purchaseDate);
        formatCurrency(purchase.amountPaidCents);
      }
      for (const email of detail.emails) formatDateTime(email.createdAt);
      for (const event of detail.timeline) formatDateTime(event.occurredAt);
      for (const insight of detail.learningInsights) formatDateTime(insight.createdAt);
      for (const note of detail.notes) formatDateTime(note.createdAt);
      // Fields used by snapshot / insights
      void detail.assessmentInsights.topStrengths.join(",");
      void detail.snapshot.nextRecommendedAction;
      void detail.content.planned;
      if (detail.assessment) {
        void detail.assessment.answers?.fullName;
        void detail.assessment.analysis?.preview?.creatorArchetype;
        void Object.entries(detail.assessment.analysis?.scores ?? {});
      }
    });
  }

  const assessments = await getAdminAssessments({ includeTestData: true });
  for (const assessment of assessments.slice(0, 30)) {
    await page(`page:/admin/assessments/${assessment.id}`, async () => {
      const record = await getAdminAssessmentById(assessment.id, { includeTestData: true });
      if (!record) throw new Error("Assessment not found");
      formatDate(record.submittedAt);
      void record.answers?.fullName;
      void record.analysis?.preview?.currentCreatorStage;
      void Object.entries(record.analysis?.scores ?? {});
    });
  }

  results.push(
    runFormatters("formatter:sanity", () => {
      formatDate("not-a-date");
    })
  );

  const failed = results.filter((row) => !row.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    failedCount: failed.length,
    failed,
    passedCount: results.length - failed.length,
    results,
  });
}

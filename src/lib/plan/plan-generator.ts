import { getAssessmentById } from "@/lib/assessment-repository";
import { buildPlanGenerationInput } from "@/lib/plan/plan-generation-context";
import { generatePlanFromTemplates } from "@/lib/plan/plan-template-engine";
import {
  createGeneratingPlanInstance,
  getPlanByPurchaseId,
  markPlanFailed,
  persistPlanGraph,
  planHasGeneratedContent,
} from "@/lib/plan/plan-repository";
import { resolveCustomerFullName } from "@/lib/plan/plan-customer-name";
import { deliverPlanPdfIfNeeded } from "@/lib/plan/plan-pdf-delivery";
import type { PlanInstanceRecord } from "@/lib/plan/plan-schema";
import type { PurchaseRecord } from "@/lib/purchase-schema";

export type PlanGenerationResult =
  | { status: "existing"; plan: PlanInstanceRecord }
  | { status: "generating"; plan: PlanInstanceRecord }
  | { status: "generated"; plan: PlanInstanceRecord }
  | { status: "failed"; plan: PlanInstanceRecord; error: string }
  | { status: "no_assessment" }
  | { status: "error"; message: string };

export async function ensurePlanForPurchase(
  userId: string,
  purchase: PurchaseRecord
): Promise<PlanGenerationResult> {
  const existing = await getPlanByPurchaseId(purchase.id);

  if (existing) {
    if (existing.status === "active" || existing.status === "completed") {
      const fullName = await resolveCustomerFullName(purchase);
      await deliverPlanPdfIfNeeded({
        userId,
        purchaseId: purchase.id,
        planInstanceId: existing.id,
        recipientEmail: purchase.customerEmail,
        fullName,
      });
      return { status: "existing", plan: existing };
    }

    if (existing.status === "generating") {
      const hasContent = await planHasGeneratedContent(existing.id);
      const createdAt = new Date(existing.createdAt).getTime();
      const isStale = Date.now() - createdAt > 5 * 60 * 1000;

      if (!hasContent && isStale) {
        return retryFailedPlan(userId, purchase);
      }

      return { status: "generating", plan: existing };
    }

    if (existing.status === "failed") {
      return retryFailedPlan(userId, purchase);
    }
  }

  if (!purchase.assessmentId) {
    return { status: "no_assessment" };
  }

  const assessment = await getAssessmentById(purchase.assessmentId);
  if (!assessment) {
    return { status: "no_assessment" };
  }

  const input = buildPlanGenerationInput(assessment);
  const placeholderSummary = {
    title: `${input.creatorContext.fullName}'s 40-Day Creator Plan`,
    subtitle: `Personalized for ${input.creatorContext.niche} creators`,
    primaryGoal: input.creatorContext.primaryGoal,
    creatorStage: input.creatorContext.stage,
    creatorArchetype: input.creatorContext.archetype,
    idealPartnershipTier: input.creatorContext.tier,
  };

  const created = await createGeneratingPlanInstance({
    userId,
    purchaseId: purchase.id,
    assessmentId: assessment.assessmentId,
    productSlug: purchase.productSlug,
    assessmentSchemaVersion: assessment.schemaVersion,
    planSummary: placeholderSummary,
  });

  if (!created) {
    return { status: "error", message: "Failed to create plan instance" };
  }

  const { plan: planInstance, created: isNew } = created;

  if (!isNew) {
    if (planInstance.status === "active" || planInstance.status === "completed") {
      return { status: "existing", plan: planInstance };
    }
    if (planInstance.status === "generating") {
      return { status: "generating", plan: planInstance };
    }
    if (planInstance.status === "failed") {
      return retryFailedPlan(userId, purchase);
    }
  }

  return runGeneration(userId, purchase, planInstance, assessment.assessmentId);
}

async function runGeneration(
  userId: string,
  purchase: PurchaseRecord,
  planInstance: PlanInstanceRecord,
  assessmentId?: string
): Promise<PlanGenerationResult> {
  const resolvedAssessmentId = assessmentId ?? planInstance.assessmentId;
  const assessment = await getAssessmentById(resolvedAssessmentId);

  if (!assessment) {
    await markPlanFailed(planInstance.id);
    return { status: "no_assessment" };
  }

  try {
    const input = buildPlanGenerationInput(assessment);

    const { blueprint, weeks, dayTasks } = generatePlanFromTemplates(input);

    await persistPlanGraph({
      planInstanceId: planInstance.id,
      blueprint,
      weeks,
      dayTasks,
    });

    const updated = await getPlanByPurchaseId(purchase.id);
    if (!updated) {
      return { status: "error", message: "Plan generated but not found" };
    }

    await deliverPlanPdfIfNeeded({
      userId,
      purchaseId: purchase.id,
      planInstanceId: updated.id,
      recipientEmail: purchase.customerEmail,
      fullName: assessment.answers.fullName || purchase.customerEmail,
    });

    return { status: "generated", plan: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plan generation failed";
    console.error(
      `[plan-generator] Failed for plan ${planInstance.id} purchase ${purchase.id}:`,
      message,
      error
    );
    await markPlanFailed(planInstance.id);
    const failed = await getPlanByPurchaseId(purchase.id);

    if (failed) {
      return { status: "failed", plan: failed, error: message };
    }

    return { status: "error", message };
  }
}

export async function retryFailedPlan(
  userId: string,
  purchase: PurchaseRecord
): Promise<PlanGenerationResult> {
  const existing = await getPlanByPurchaseId(purchase.id);
  if (!existing) {
    return ensurePlanForPurchase(userId, purchase);
  }

  if (existing.status === "active" || existing.status === "completed") {
    return { status: "existing", plan: existing };
  }

  const supabase = await import("@/lib/supabase/admin").then((m) => m.getSupabaseAdmin());

  await supabase.from("plan_task_completions").delete().eq("plan_instance_id", existing.id);
  await supabase.from("plan_day_tasks").delete().eq("plan_instance_id", existing.id);
  await supabase.from("plan_days").delete().eq("plan_instance_id", existing.id);
  await supabase.from("plan_weeks").delete().eq("plan_instance_id", existing.id);

  const { error } = await supabase
    .from("plan_instances")
    .update({ status: "generating", updated_at: new Date().toISOString() })
    .eq("id", existing.id);

  if (error) {
    return { status: "error", message: error.message };
  }

  const refreshed = await getPlanByPurchaseId(purchase.id);
  if (!refreshed) {
    return { status: "error", message: "Failed to reset plan for retry" };
  }

  return runGeneration(userId, purchase, refreshed);
}

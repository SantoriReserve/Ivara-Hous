import { getAssessmentById } from "@/lib/assessment-repository";
import type { AssessmentRecord } from "@/lib/assessment-schema";
import { extractCreatorContext, type CreatorContext } from "@/lib/plan/plan-generation-context";
import { getActivePlanForUser } from "@/lib/plan/plan-repository";
import type { PlanInstanceRecord } from "@/lib/plan/plan-schema";
import { getActivePurchaseForUser } from "@/lib/purchase-repository";

export type DashboardContext = {
  plan: PlanInstanceRecord | null;
  assessment: AssessmentRecord | null;
  creatorContext: CreatorContext | null;
};

export async function getDashboardContext(userId: string): Promise<DashboardContext> {
  const [plan, purchase] = await Promise.all([
    getActivePlanForUser(userId),
    getActivePurchaseForUser(userId),
  ]);

  const assessmentId = plan?.assessmentId ?? purchase?.assessmentId;
  if (!assessmentId) {
    return { plan, assessment: null, creatorContext: null };
  }

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    return { plan, assessment: null, creatorContext: null };
  }

  return {
    plan,
    assessment,
    creatorContext: extractCreatorContext(assessment),
  };
}

import { getAssessmentById } from "@/lib/assessment-repository";
import type { PurchaseRecord } from "@/lib/purchase-schema";

export async function resolveCustomerFullName(purchase: PurchaseRecord): Promise<string> {
  if (purchase.assessmentId) {
    const assessment = await getAssessmentById(purchase.assessmentId);
    const name = assessment?.answers.fullName?.trim();
    if (name) {
      return name;
    }
  }

  const localPart = purchase.customerEmail.split("@")[0]?.trim();
  return localPart || "Creator";
}

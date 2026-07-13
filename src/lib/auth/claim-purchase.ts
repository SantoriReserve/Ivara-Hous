import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { getPurchaseByCheckoutSessionId } from "@/lib/purchase-repository";

async function linkAssessmentToUser(
  assessmentId: string | null,
  userId: string
): Promise<void> {
  if (!assessmentId) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("assessments")
    .update({
      user_id: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", assessmentId)
    .is("user_id", null);

  if (error) {
    throw new Error(`Failed to link assessment to user: ${error.message}`);
  }
}

async function linkPurchaseToUser(purchaseId: string, userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("purchases")
    .update({
      user_id: userId,
      claimed_at: new Date().toISOString(),
    })
    .eq("id", purchaseId)
    .is("user_id", null);

  if (error) {
    throw new Error(`Failed to link purchase to user: ${error.message}`);
  }
}

export async function claimPurchaseByCheckoutSessionId(
  userId: string,
  userEmail: string,
  stripeCheckoutSessionId: string
): Promise<{ claimed: boolean; reason?: string }> {
  const purchase = await getPurchaseByCheckoutSessionId(stripeCheckoutSessionId);

  if (!purchase) {
    return { claimed: false, reason: "purchase_not_found" };
  }

  if (purchase.status !== "completed") {
    return { claimed: false, reason: "purchase_not_completed" };
  }

  if (purchase.userId && purchase.userId !== userId) {
    return { claimed: false, reason: "purchase_already_claimed" };
  }

  if (normalizeEmail(purchase.customerEmail) !== normalizeEmail(userEmail)) {
    return { claimed: false, reason: "email_mismatch" };
  }

  if (!purchase.userId) {
    await linkPurchaseToUser(purchase.id, userId);
    await linkAssessmentToUser(purchase.assessmentId, userId);
  }

  return { claimed: true };
}

export async function claimUnclaimedPurchasesForEmail(
  userId: string,
  userEmail: string
): Promise<number> {
  const supabase = getSupabaseAdmin();
  const normalizedEmail = normalizeEmail(userEmail);

  const { data: purchases, error } = await supabase
    .from("purchases")
    .select("id, customer_email, assessment_id, status, user_id")
    .is("user_id", null)
    .eq("status", "completed");

  if (error) {
    throw new Error(`Failed to load unclaimed purchases: ${error.message}`);
  }

  let claimedCount = 0;

  for (const purchase of purchases ?? []) {
    if (normalizeEmail(purchase.customer_email) !== normalizedEmail) {
      continue;
    }

    await linkPurchaseToUser(purchase.id, userId);
    await linkAssessmentToUser(purchase.assessment_id, userId);
    claimedCount += 1;
  }

  return claimedCount;
}

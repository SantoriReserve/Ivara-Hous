import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Paid dashboard entitlement is scoped strictly by auth user id.
 * Purchases are never loaded by email here — only by `user_id` — so one
 * customer cannot inherit another customer's access.
 */
export async function userHasPaidDashboardAccess(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("product_slug", CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug)
    .eq("status", "completed")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify dashboard access: ${error.message}`);
  }

  return Boolean(data);
}

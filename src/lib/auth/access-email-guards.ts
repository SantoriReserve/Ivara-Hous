import { normalizeEmail } from "@/lib/auth/normalize-email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const ACCOUNT_ACCESS_EMAIL_TYPES = ["account_access_setup", "password_reset"] as const;

export async function hasAccountAccessEmailBeenSentForPurchase(
  purchaseId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_deliveries")
    .select("id")
    .eq("purchase_id", purchaseId)
    .eq("email_type", "account_access_setup")
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[email] Failed to check account access delivery:", error.message);
    return false;
  }

  return Boolean(data);
}

/**
 * Soft rate-limit for resend / forgot-password flows.
 * Returns true if a setup/reset email was sent to this address recently.
 */
export async function wasAccessEmailSentRecently(
  email: string,
  withinMs = 60_000
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);
  const since = new Date(Date.now() - withinMs).toISOString();

  const { data, error } = await supabase
    .from("email_deliveries")
    .select("id")
    .eq("recipient_email", normalized)
    .in("email_type", [...ACCOUNT_ACCESS_EMAIL_TYPES])
    .eq("status", "sent")
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[email] Failed to check recent access delivery:", error.message);
    return false;
  }

  return Boolean(data);
}

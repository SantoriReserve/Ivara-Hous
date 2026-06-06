import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type EmailDeliveryStatus = "sent" | "failed";

export async function recordEmailDelivery(params: {
  userId?: string;
  purchaseId?: string;
  emailType: string;
  recipientEmail: string;
  status: EmailDeliveryStatus;
  resendId: string | null;
  errorMessage: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("email_deliveries").insert({
    user_id: params.userId ?? null,
    purchase_id: params.purchaseId ?? null,
    email_type: params.emailType,
    recipient_email: params.recipientEmail,
    status: params.status,
    resend_id: params.resendId,
    error_message: params.errorMessage,
  });

  if (error) {
    console.error("[email] Failed to record delivery:", error.message);
  }
}

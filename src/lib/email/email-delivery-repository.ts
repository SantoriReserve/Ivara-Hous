import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type EmailDeliveryStatus = "sent" | "failed";

export async function recordEmailDelivery(params: {
  userId?: string;
  purchaseId?: string;
  planInstanceId?: string;
  emailType: string;
  recipientEmail: string;
  status: EmailDeliveryStatus;
  resendId: string | null;
  errorMessage: string | null;
  attachmentUrl?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("email_deliveries").insert({
    user_id: params.userId ?? null,
    purchase_id: params.purchaseId ?? null,
    plan_instance_id: params.planInstanceId ?? null,
    email_type: params.emailType,
    recipient_email: params.recipientEmail,
    status: params.status,
    resend_id: params.resendId,
    attachment_url: params.attachmentUrl ?? null,
    error_message: params.errorMessage,
  });

  if (error) {
    console.error("[email] Failed to record delivery:", error.message);
  }
}

export async function hasPlanPdfBeenSent(planInstanceId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_deliveries")
    .select("id")
    .eq("plan_instance_id", planInstanceId)
    .eq("email_type", "plan_pdf")
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[email] Failed to check plan PDF delivery:", error.message);
    return false;
  }

  return Boolean(data);
}

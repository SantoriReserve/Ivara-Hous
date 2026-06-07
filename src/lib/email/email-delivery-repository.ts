import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type EmailDeliveryStatus = "sent" | "failed";

export type EmailDeliveryRecord = {
  id: string;
  userId: string | null;
  purchaseId: string | null;
  planInstanceId: string | null;
  emailType: string;
  recipientEmail: string;
  status: EmailDeliveryStatus;
  resendId: string | null;
  attachmentUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
};

const PURCHASE_COMPLETE_EMAIL_TYPES = ["purchase_complete", "plan_pdf", "purchase_welcome"];

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
    .in("email_type", PURCHASE_COMPLETE_EMAIL_TYPES)
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[email] Failed to check plan PDF delivery:", error.message);
    return false;
  }

  return Boolean(data);
}

function mapDeliveryRow(row: Record<string, unknown>): EmailDeliveryRecord {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : null,
    purchaseId: row.purchase_id ? String(row.purchase_id) : null,
    planInstanceId: row.plan_instance_id ? String(row.plan_instance_id) : null,
    emailType: String(row.email_type),
    recipientEmail: String(row.recipient_email),
    status: row.status as EmailDeliveryStatus,
    resendId: row.resend_id ? String(row.resend_id) : null,
    attachmentUrl: row.attachment_url ? String(row.attachment_url) : null,
    errorMessage: row.error_message ? String(row.error_message) : null,
    createdAt: String(row.created_at),
  };
}

/** Prepared for future admin dashboard — list recent email deliveries. */
export async function listEmailDeliveries(params?: {
  limit?: number;
  emailType?: string;
  status?: EmailDeliveryStatus;
}): Promise<EmailDeliveryRecord[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("email_deliveries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(params?.limit ?? 100);

  if (params?.emailType) {
    query = query.eq("email_type", params.emailType);
  }
  if (params?.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[email] Failed to list deliveries:", error.message);
    return [];
  }

  return (data ?? []).map((row) => mapDeliveryRow(row as Record<string, unknown>));
}

/** Prepared for future admin dashboard — aggregate delivery stats. */
export async function getEmailDeliveryStats(): Promise<{
  totalSent: number;
  totalFailed: number;
  byType: Record<string, { sent: number; failed: number }>;
}> {
  const deliveries = await listEmailDeliveries({ limit: 5000 });
  const byType: Record<string, { sent: number; failed: number }> = {};
  let totalSent = 0;
  let totalFailed = 0;

  for (const delivery of deliveries) {
    if (!byType[delivery.emailType]) {
      byType[delivery.emailType] = { sent: 0, failed: 0 };
    }
    if (delivery.status === "sent") {
      totalSent += 1;
      byType[delivery.emailType].sent += 1;
    } else {
      totalFailed += 1;
      byType[delivery.emailType].failed += 1;
    }
  }

  return { totalSent, totalFailed, byType };
}

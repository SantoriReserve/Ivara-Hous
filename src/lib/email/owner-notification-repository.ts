import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const OWNER_NOTIFICATION_EMAIL_TYPES = {
  creatorApplication: "owner_creator_application",
  partnerInquiry: "owner_partner_inquiry",
  contactInquiry: "owner_contact_inquiry",
  purchase: "owner_purchase",
} as const;

export type OwnerNotificationEmailType =
  (typeof OWNER_NOTIFICATION_EMAIL_TYPES)[keyof typeof OWNER_NOTIFICATION_EMAIL_TYPES];

export function buildOwnerEventDedupKey(
  emailType: OwnerNotificationEmailType,
  eventId: string
): string {
  return `owner-event:${emailType}:${eventId}`;
}

export async function hasOwnerNotificationBeenSent(params: {
  emailType: OwnerNotificationEmailType;
  eventId?: string;
  purchaseId?: string;
}): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  if (params.purchaseId) {
    const { data, error } = await supabase
      .from("email_deliveries")
      .select("id")
      .eq("purchase_id", params.purchaseId)
      .eq("email_type", params.emailType)
      .eq("status", "sent")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[owner-notification] Failed purchase dedup check:", error.message);
      return false;
    }

    return Boolean(data);
  }

  if (!params.eventId) {
    return false;
  }

  const dedupKey = buildOwnerEventDedupKey(params.emailType, params.eventId);
  const { data, error } = await supabase
    .from("email_deliveries")
    .select("id")
    .eq("email_type", params.emailType)
    .eq("attachment_url", dedupKey)
    .eq("status", "sent")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[owner-notification] Failed event dedup check:", error.message);
    return false;
  }

  return Boolean(data);
}

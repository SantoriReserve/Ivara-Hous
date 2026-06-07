import { renderGeneralCustomerNotificationEmail } from "@/lib/email/templates";
import { sendBrandedEmail } from "@/lib/email/send-email";

export async function sendCustomerNotificationEmail(params: {
  to: string;
  fullName: string;
  title: string;
  messageHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  userId?: string;
  purchaseId?: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const { subject, html } = renderGeneralCustomerNotificationEmail({
    fullName: params.fullName,
    title: params.title,
    messageHtml: params.messageHtml,
    ctaLabel: params.ctaLabel,
    ctaUrl: params.ctaUrl,
  });

  const result = await sendBrandedEmail({
    to: params.to,
    subject,
    html,
    emailType: "customer_notification",
    userId: params.userId,
    purchaseId: params.purchaseId,
  });

  if (!result.sent) {
    return { sent: false, reason: result.reason };
  }

  return { sent: true };
}

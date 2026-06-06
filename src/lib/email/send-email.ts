import { Resend } from "resend";
import { getEmailFromAddress, getResendApiKey, isEmailConfigured } from "@/lib/email/env";
import { recordEmailDelivery } from "@/lib/email/email-delivery-repository";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  emailType: string;
  userId?: string;
  purchaseId?: string;
};

export type SendEmailResult =
  | { sent: true; resendId: string | null }
  | { sent: false; reason: string };

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }
  return resendClient;
}

export async function sendBrandedEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!isEmailConfigured()) {
    console.warn(`[email] Skipping ${params.emailType} — RESEND_API_KEY not configured`);
    return { sent: false, reason: "email_not_configured" };
  }

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getEmailFromAddress(),
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      await recordEmailDelivery({
        userId: params.userId,
        purchaseId: params.purchaseId,
        emailType: params.emailType,
        recipientEmail: params.to,
        status: "failed",
        resendId: null,
        errorMessage: error.message,
      });
      return { sent: false, reason: error.message };
    }

    await recordEmailDelivery({
      userId: params.userId,
      purchaseId: params.purchaseId,
      emailType: params.emailType,
      recipientEmail: params.to,
      status: "sent",
      resendId: data?.id ?? null,
      errorMessage: null,
    });

    return { sent: true, resendId: data?.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    await recordEmailDelivery({
      userId: params.userId,
      purchaseId: params.purchaseId,
      emailType: params.emailType,
      recipientEmail: params.to,
      status: "failed",
      resendId: null,
      errorMessage: message,
    });
    return { sent: false, reason: message };
  }
}

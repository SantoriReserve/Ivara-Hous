import { Resend } from "resend";
import {
  getEmailFromAddress,
  getReplyToEmail,
  getResendApiKey,
  isEmailConfigured,
} from "@/lib/email/env";
import { recordEmailDelivery } from "@/lib/email/email-delivery-repository";

export type EmailAttachment = {
  filename: string;
  content: Buffer;
};

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  emailType: string;
  userId?: string;
  purchaseId?: string;
  planInstanceId?: string;
  attachments?: EmailAttachment[];
  attachmentUrl?: string | null;
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

  const deliveryBase = {
    userId: params.userId,
    purchaseId: params.purchaseId,
    planInstanceId: params.planInstanceId,
    emailType: params.emailType,
    recipientEmail: params.to,
    attachmentUrl: params.attachmentUrl ?? null,
  };

  try {
    const { data, error } = await getResendClient().emails.send({
      from: getEmailFromAddress(),
      replyTo: getReplyToEmail(),
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content.toString("base64"),
      })),
    });

    if (error) {
      await recordEmailDelivery({
        ...deliveryBase,
        status: "failed",
        resendId: null,
        errorMessage: error.message,
      });
      return { sent: false, reason: error.message };
    }

    await recordEmailDelivery({
      ...deliveryBase,
      status: "sent",
      resendId: data?.id ?? null,
      errorMessage: null,
    });

    return { sent: true, resendId: data?.id ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    await recordEmailDelivery({
      ...deliveryBase,
      status: "failed",
      resendId: null,
      errorMessage: message,
    });
    return { sent: false, reason: message };
  }
}

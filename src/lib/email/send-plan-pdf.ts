import { ROUTES } from "@/lib/constants";
import { renderPlanPdfEmail } from "@/lib/email/templates";
import { sendBrandedEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/stripe";

export async function sendPlanPdfEmail(params: {
  to: string;
  fullName: string;
  userId: string;
  purchaseId: string;
  planInstanceId: string;
  planTitle: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}): Promise<{ sent: boolean; reason?: string }> {
  const dashboardUrl = `${getSiteUrl().replace(/\/$/, "")}${ROUTES.dashboard}`;
  const { subject, html } = renderPlanPdfEmail({
    fullName: params.fullName,
    planTitle: params.planTitle,
    dashboardUrl,
  });

  const result = await sendBrandedEmail({
    to: params.to,
    subject,
    html,
    emailType: "plan_pdf",
    userId: params.userId,
    purchaseId: params.purchaseId,
    planInstanceId: params.planInstanceId,
    attachments: [
      {
        filename: params.pdfFilename,
        content: params.pdfBuffer,
      },
    ],
    attachmentUrl: `attachment:${params.pdfFilename}`,
  });

  if (!result.sent) {
    return { sent: false, reason: result.reason };
  }

  return { sent: true };
}

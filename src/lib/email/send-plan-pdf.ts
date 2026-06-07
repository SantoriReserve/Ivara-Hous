import { ROUTES } from "@/lib/constants";
import { renderPurchaseCompleteEmail } from "@/lib/email/templates";
import { sendBrandedEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/stripe";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";

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
  const { subject, html } = renderPurchaseCompleteEmail({
    fullName: params.fullName,
    productName: CREATOR_DEVELOPMENT_PLAN_PRODUCT.name,
    planTitle: params.planTitle,
    dashboardUrl,
  });

  const result = await sendBrandedEmail({
    to: params.to,
    subject,
    html,
    emailType: "purchase_complete",
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

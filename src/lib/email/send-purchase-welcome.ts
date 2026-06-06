import { ROUTES } from "@/lib/constants";
import { renderPurchaseWelcomeEmail } from "@/lib/email/templates";
import { sendBrandedEmail } from "@/lib/email/send-email";
import { getSiteUrl } from "@/lib/stripe";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";

export async function sendPurchaseWelcomeEmail(params: {
  to: string;
  fullName: string;
  userId: string;
  purchaseId: string;
}): Promise<void> {
  const dashboardUrl = `${getSiteUrl().replace(/\/$/, "")}${ROUTES.dashboard}`;
  const { subject, html } = renderPurchaseWelcomeEmail({
    fullName: params.fullName,
    productName: CREATOR_DEVELOPMENT_PLAN_PRODUCT.name,
    dashboardUrl,
  });

  await sendBrandedEmail({
    to: params.to,
    subject,
    html,
    emailType: "purchase_welcome",
    userId: params.userId,
    purchaseId: params.purchaseId,
  });
}

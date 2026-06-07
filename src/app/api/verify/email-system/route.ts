import { NextResponse } from "next/server";
import { checkEmailDnsHealth } from "@/lib/email/dns-health";
import {
  getEmailFromAddress,
  getReplyToEmail,
  getSupportEmail,
  isEmailConfigured,
} from "@/lib/email/env";
import { getEmailDeliveryStats } from "@/lib/email/email-delivery-repository";
import {
  renderContactFormConfirmationEmail,
  renderGeneralCustomerNotificationEmail,
  renderPdfDeliveryEmail,
  renderPurchaseCompleteEmail,
} from "@/lib/email/templates";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  const checks: Array<{ name: string; pass: boolean; detail: string }> = [];

  checks.push({
    name: "Resend API key configured",
    pass: isEmailConfigured(),
    detail: isEmailConfigured()
      ? "RESEND_API_KEY is set"
      : "RESEND_API_KEY is missing",
  });

  const fromAddress = getEmailFromAddress();
  checks.push({
    name: "Customer from address",
    pass: fromAddress.includes("info@ivarahous.com"),
    detail: fromAddress,
  });

  checks.push({
    name: "Reply-to / support email",
    pass:
      getReplyToEmail().includes("info@ivarahous.com") &&
      getSupportEmail().includes("info@ivarahous.com"),
    detail: `${getReplyToEmail()} (reply-to), ${getSupportEmail()} (support)`,
  });

  try {
    renderPurchaseCompleteEmail({
      fullName: "Verify Creator",
      productName: "40-Day Creator Development Plan",
      planTitle: "Verify Creator's 40-Day Creator Plan",
      dashboardUrl: "https://ivara-hous.vercel.app/dashboard",
    });
    renderPdfDeliveryEmail({
      fullName: "Verify Creator",
      planTitle: "Verify Creator's 40-Day Creator Plan",
      dashboardUrl: "https://ivara-hous.vercel.app/dashboard",
    });
    renderContactFormConfirmationEmail({
      fullName: "Verify Creator",
      subject: "Verification inquiry",
    });
    renderGeneralCustomerNotificationEmail({
      fullName: "Verify Creator",
      title: "Account update",
      messageHtml: "<p>Verification message.</p>",
    });
    checks.push({
      name: "Email templates render",
      pass: true,
      detail: "purchase_complete, pdf_delivery, contact_confirmation, customer_notification",
    });
  } catch (error) {
    checks.push({
      name: "Email templates render",
      pass: false,
      detail: error instanceof Error ? error.message : "Template render failed",
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("email_deliveries").select("id").limit(1);
    checks.push({
      name: "email_deliveries table",
      pass: !error,
      detail: error?.message ?? "Table accessible for delivery analytics",
    });
  } catch (error) {
    checks.push({
      name: "email_deliveries table",
      pass: false,
      detail: error instanceof Error ? error.message : "Table check failed",
    });
  }

  let deliveryStats: Awaited<ReturnType<typeof getEmailDeliveryStats>> | null = null;
  try {
    deliveryStats = await getEmailDeliveryStats();
    checks.push({
      name: "Delivery analytics query",
      pass: true,
      detail: `${deliveryStats.totalSent} sent, ${deliveryStats.totalFailed} failed`,
    });
  } catch (error) {
    checks.push({
      name: "Delivery analytics query",
      pass: false,
      detail: error instanceof Error ? error.message : "Stats query failed",
    });
  }

  checks.push(...(await checkEmailDnsHealth()));

  const pass = checks.every((check) => check.pass);

  return NextResponse.json(
    {
      pass,
      fromAddress,
      supportEmail: getSupportEmail(),
      deliveryStats,
      checks,
      customerEmailFlows: {
        assessment: "No automated assessment email — results shown on-site before checkout",
        purchase: "Stripe checkout only — no separate purchase email before plan generation",
        planDelivery:
          "Single purchase_complete email with PDF attachment after plan becomes active",
        dashboardAccess: "Customer creates password at /claim — no welcome email sent",
        contactForm: "contact_confirmation to customer + contact_form_internal to info@ivarahous.com",
        duplicateEmailsEliminated: "purchase_welcome removed — one email per purchase",
      },
      untouchedFlows: [
        "creator-application → Make webhook",
        "partner-with-us → handleFormSubmission (unchanged)",
        "creative-partner-application → handleFormSubmission (unchanged)",
      ],
    },
    { status: pass ? 200 : 503 }
  );
}

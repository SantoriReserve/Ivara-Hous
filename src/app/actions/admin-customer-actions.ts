"use server";

import { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { sendPasswordSetupEmail } from "@/lib/auth/send-password-setup-email";
import { requireAdminUser } from "@/lib/admin/admin-auth";
import { getAdminCustomerDetail } from "@/lib/admin/admin-repository";
import { sendCustomerNotificationEmail } from "@/lib/email/send-customer-notification";
import { getSiteUrl } from "@/lib/stripe";
import { ROUTES } from "@/lib/constants";

export type AdminCustomerActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

export async function adminResendPasswordSetupAction(
  customerKey: string
): Promise<AdminCustomerActionResult> {
  await requireAdminUser();
  const customer = await getAdminCustomerDetail(customerKey, { includeTestData: true });
  if (!customer) {
    return { success: false, error: "Customer not found." };
  }

  const email = normalizeEmail(customer.email);
  let userId = customer.userId;
  if (!userId) {
    const authUser = await findAuthUserByEmail(email);
    userId = authUser?.id ?? null;
  }

  if (!userId) {
    return {
      success: false,
      error: "No Auth user exists for this email yet. Ask the customer to use Forgot Password on the site.",
    };
  }

  const result = await sendPasswordSetupEmail({
    email,
    fullName: customer.name,
    userId,
    purchaseId: customer.purchaseId ?? undefined,
    purpose: "setup",
  });

  if (!result.sent) {
    return {
      success: false,
      error:
        result.reason === "rate_limited"
          ? "An access email was sent recently. Wait a minute before resending."
          : "Could not send password setup email.",
    };
  }

  return { success: true, message: "Password setup email sent." };
}

export async function adminResendWelcomeEmailAction(
  customerKey: string
): Promise<AdminCustomerActionResult> {
  await requireAdminUser();
  const customer = await getAdminCustomerDetail(customerKey, { includeTestData: true });
  if (!customer) {
    return { success: false, error: "Customer not found." };
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const result = await sendCustomerNotificationEmail({
    to: customer.email,
    fullName: customer.name,
    title: "Welcome to your Creator Development Plan",
    messageHtml: `
      <p style="margin:0 0 18px;">Your 40-Day Creator Development Plan is ready.</p>
      <p style="margin:0 0 18px;">Use the button below to sign in. If you have not set a password yet, choose Forgot Password on the sign-in page to receive a secure access link.</p>
    `,
    ctaLabel: "Open Dashboard",
    ctaUrl: `${siteUrl}${ROUTES.login}`,
    userId: customer.userId ?? undefined,
    purchaseId: customer.purchaseId ?? undefined,
  });

  if (!result.sent) {
    return { success: false, error: result.reason ?? "Could not send welcome email." };
  }

  return { success: true, message: "Welcome email sent." };
}

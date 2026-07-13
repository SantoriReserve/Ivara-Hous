import { wasAccessEmailSentRecently } from "@/lib/auth/access-email-guards";
import { logAuthEvent } from "@/lib/auth/auth-events";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { ROUTES } from "@/lib/constants";
import { sendBrandedEmail } from "@/lib/email/send-email";
import { renderAccountAccessEmail } from "@/lib/email/templates";
import { getSiteUrl } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type PasswordSetupEmailResult =
  | { sent: true; actionLink: string }
  | { sent: false; reason: string };

/**
 * Generate a Supabase recovery link and deliver it through Resend.
 * This avoids relying on Supabase SMTP for customer-facing password emails.
 */
export async function sendPasswordSetupEmail(params: {
  email: string;
  fullName?: string;
  userId?: string;
  purchaseId?: string;
  purpose?: "setup" | "reset";
  /** Bypass the short resend cooldown (use only for first webhook send). */
  ignoreRateLimit?: boolean;
}): Promise<PasswordSetupEmailResult> {
  const email = normalizeEmail(params.email);
  const purpose = params.purpose ?? "setup";

  if (!params.ignoreRateLimit && (await wasAccessEmailSentRecently(email, 60_000))) {
    logAuthEvent("password_setup.email_skipped", {
      email,
      purchaseId: params.purchaseId ?? null,
      userId: params.userId ?? null,
      purpose,
      reason: "rate_limited",
    });
    return { sent: false, reason: "rate_limited" };
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const redirectTo = `${siteUrl}${ROUTES.authCallback}?next=${encodeURIComponent(ROUTES.loginResetPassword)}`;

  const admin = getSupabaseAdmin();
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo },
  });

  if (linkError || !linkData.properties?.action_link) {
    const reason = linkError?.message ?? "Could not generate password setup link";
    logAuthEvent("password_setup.email_failed", {
      email,
      purchaseId: params.purchaseId ?? null,
      userId: params.userId ?? null,
      purpose,
      reason,
    });
    return { sent: false, reason };
  }

  const actionLink = linkData.properties.action_link;
  const { subject, html } = renderAccountAccessEmail({
    fullName: params.fullName ?? "Creator",
    actionUrl: actionLink,
    purpose,
    loginUrl: `${siteUrl}${ROUTES.login}`,
  });

  const emailResult = await sendBrandedEmail({
    to: email,
    subject,
    html,
    emailType: purpose === "reset" ? "password_reset" : "account_access_setup",
    userId: params.userId,
    purchaseId: params.purchaseId,
  });

  if (!emailResult.sent) {
    logAuthEvent("password_setup.email_failed", {
      email,
      purchaseId: params.purchaseId ?? null,
      userId: params.userId ?? null,
      purpose,
      reason: emailResult.reason,
    });
    return { sent: false, reason: emailResult.reason };
  }

  logAuthEvent("password_setup.email_sent", {
    email,
    purpose,
    purchaseId: params.purchaseId ?? null,
    userId: params.userId ?? null,
  });

  return { sent: true, actionLink };
}

"use server";

import { redirect } from "next/navigation";
import {
  claimPurchaseByCheckoutSessionId,
  claimUnclaimedPurchasesForEmail,
} from "@/lib/auth/claim-purchase";
import { wasAccessEmailSentRecently } from "@/lib/auth/access-email-guards";
import { logAuthEvent } from "@/lib/auth/auth-events";
import { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { provisionPurchaseAccess } from "@/lib/auth/provision-purchase-access";
import { updateProfileFullName } from "@/lib/auth/profile-repository";
import { sendPasswordSetupEmail } from "@/lib/auth/send-password-setup-email";
import { ROUTES } from "@/lib/constants";
import {
  getCompletedPurchasesByEmail,
  getPurchaseByCheckoutSessionId,
} from "@/lib/purchase-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCheckoutSessionEmail,
  isValidCreatorDevelopmentPurchaseSession,
} from "@/lib/stripe-checkout-session";
import { getStripe } from "@/lib/stripe";

const MIN_PASSWORD_LENGTH = 8;

const FRIENDLY_GENERIC_ERROR =
  "Something went wrong. Please try again in a moment, or contact support if it continues.";

export type AuthActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

function friendlyClientError(_error: unknown, fallback = FRIENDLY_GENERIC_ERROR): string {
  return fallback;
}

async function waitForPurchase(stripeCheckoutSessionId: string, attempts = 10) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const purchase = await getPurchaseByCheckoutSessionId(stripeCheckoutSessionId);
    if (purchase) {
      return purchase;
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return null;
}

export async function registerAndClaimAction(formData: FormData): Promise<AuthActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const sessionId = String(formData.get("sessionId") ?? "").trim();

  if (!sessionId) {
    return {
      success: false,
      error: "Checkout session is missing. Return to your purchase confirmation page and try again.",
    };
  }

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  if (!password) {
    return { success: false, error: "Password is required." };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { success: false, error: passwordError };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!isValidCreatorDevelopmentPurchaseSession(session)) {
      return { success: false, error: "Purchase could not be verified." };
    }

    const checkoutEmail = getCheckoutSessionEmail(session);
    if (!checkoutEmail || normalizeEmail(checkoutEmail) !== email) {
      return {
        success: false,
        error: "Use the same email address from your Stripe checkout.",
      };
    }

    const existingPurchase = await waitForPurchase(sessionId);
    if (!existingPurchase) {
      return {
        success: false,
        error:
          "Your purchase is still processing. Wait a moment and try again, or contact support with your Stripe receipt.",
      };
    }

    if (existingPurchase.userId) {
      const setup = await sendPasswordSetupEmail({
        email,
        purchaseId: existingPurchase.id,
        userId: existingPurchase.userId,
        purpose: "setup",
      });

      return {
        success: false,
        error: setup.sent
          ? "Your purchase is already linked to an account. Check your email for a link to set or reset your password, then sign in."
          : setup.reason === "rate_limited"
            ? "We recently sent an access email to this address. Check your inbox and spam folder, then try again in a minute."
            : "Your purchase is already linked to an account. Use Forgot Password on the sign-in page, then sign in.",
      };
    }

    const admin = getSupabaseAdmin();
    const existingUser = await findAuthUserByEmail(email);

    if (existingUser) {
      const claimResult = await claimPurchaseByCheckoutSessionId(
        existingUser.id,
        email,
        sessionId
      );

      if (!claimResult.claimed) {
        return {
          success: false,
          error:
            "An account with this email already exists, but we could not link this purchase. Sign in or use Forgot Password, then contact support if access is missing.",
        };
      }

      await sendPasswordSetupEmail({
        email,
        userId: existingUser.id,
        purchaseId: existingPurchase.id,
        purpose: "reset",
      });

      return {
        success: false,
        error:
          "An account with this email already exists. Check your email for a password link, then sign in to open your dashboard.",
      };
    }

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created.user) {
      const message = createError?.message ?? "Could not create account.";
      logAuthEvent("login.failure", {
        email,
        reason: "register_create_failed",
        detail: message,
      });
      const normalized = message.toLowerCase();
      if (
        normalized.includes("already") ||
        normalized.includes("registered") ||
        normalized.includes("exists")
      ) {
        return {
          success: false,
          error:
            "An account with this email already exists. Sign in with your password, or use Forgot Password.",
        };
      }
      return {
        success: false,
        error: "We could not create your account right now. Please try again in a moment.",
      };
    }

    const userId = created.user.id;

    const claimResult = await claimPurchaseByCheckoutSessionId(userId, email, sessionId);
    if (!claimResult.claimed) {
      await admin.auth.admin.deleteUser(userId);
      logAuthEvent("purchase.link_failed", {
        email,
        sessionId,
        reason: claimResult.reason ?? "claim_failed",
      });
      return {
        success: false,
        error: "Could not link your purchase to this account. Contact support.",
      };
    }

    if (fullName) {
      await updateProfileFullName(userId, fullName);
    }

    const supabase = await createSupabaseServerClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      logAuthEvent("login.failure", {
        email,
        userId,
        reason: "register_signin_failed",
      });
      return {
        success: false,
        error: "Account created but sign-in failed. Try signing in manually.",
      };
    }

    logAuthEvent("login.success", {
      email,
      userId,
      source: "register_and_claim",
    });
  } catch (error) {
    console.error("[auth] registerAndClaim error:", error);
    return {
      success: false,
      error: friendlyClientError(error),
    };
  }

  redirect(ROUTES.dashboard);
}

export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const nextPath = String(formData.get("nextPath") ?? ROUTES.dashboard);

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      logAuthEvent("login.failure", {
        email,
        code: error?.code ?? null,
        status: error?.status ?? null,
        message: error?.message ?? "no_user",
      });

      const [authUser, purchases] = await Promise.all([
        findAuthUserByEmail(email).catch(() => null),
        getCompletedPurchasesByEmail(email).catch(() => []),
      ]);

      if (!authUser && purchases.length > 0) {
        const provision = await provisionPurchaseAccess(purchases[0], {
          forceEmail: true,
        });
        return {
          success: false,
          error: provision.emailSent
            ? "That password isn't set yet. We just emailed you a secure link to create one — then you can sign in."
            : provision.reason === "rate_limited" || provision.emailSkipped
              ? "That password isn't set yet. Check your inbox for the access email, or use Forgot Password to resend it."
              : "That password isn't set yet. Use Forgot Password with this email to receive an access link.",
        };
      }

      if (authUser) {
        return {
          success: false,
          error:
            "That password doesn't match. Double-check it, or use Forgot Password to set a new one.",
        };
      }

      return {
        success: false,
        error:
          "We couldn't sign you in with those details. Check your email and password, or use Forgot Password.",
      };
    }

    const claimedCount = await claimUnclaimedPurchasesForEmail(data.user.id, email);
    if (claimedCount > 0) {
      logAuthEvent("purchase.linked", {
        email,
        userId: data.user.id,
        claimedCount,
        source: "signin",
      });
    }

    logAuthEvent("login.success", {
      email,
      userId: data.user.id,
      source: "password",
    });
  } catch (error) {
    console.error("[auth] signIn unexpected error:", error);
    return {
      success: false,
      error: friendlyClientError(error),
    };
  }

  const safeNext = nextPath.startsWith("/") ? nextPath : ROUTES.dashboard;
  redirect(safeNext);
}

export async function requestPasswordResetAction(
  formData: FormData
): Promise<AuthActionResult> {
  const email = normalizeEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  logAuthEvent("password_reset.requested", { email });

  try {
    if (await wasAccessEmailSentRecently(email, 60_000)) {
      // Still success UX — avoid leaking account existence and avoid spam.
      return {
        success: true,
        message:
          "If an account exists, an access email was recently sent. Check your inbox and spam folder.",
      };
    }

    let authUser = await findAuthUserByEmail(email);
    const purchases = await getCompletedPurchasesByEmail(email);

    if (!authUser && purchases.length > 0) {
      const provision = await provisionPurchaseAccess(purchases[0], {
        forceEmail: true,
      });
      if (provision.emailSent || provision.reason === "rate_limited") {
        return { success: true };
      }
      if (provision.userId) {
        authUser = await findAuthUserByEmail(email);
      } else {
        logAuthEvent("password_reset.failed", {
          email,
          reason: provision.reason ?? "provision_failed",
        });
        return {
          success: false,
          error:
            "We found your purchase but could not prepare account access. Please try again in a few minutes or contact support.",
        };
      }
    }

    if (!authUser) {
      // Do not reveal whether the email exists.
      return { success: true };
    }

    const emailResult = await sendPasswordSetupEmail({
      email,
      userId: authUser.id,
      purchaseId: purchases[0]?.id,
      purpose: purchases.length > 0 && !purchases[0]?.userId ? "setup" : "reset",
    });

    if (!emailResult.sent && emailResult.reason !== "rate_limited") {
      logAuthEvent("password_reset.failed", {
        email,
        reason: emailResult.reason,
      });
      return {
        success: false,
        error: "We could not send an access email. Please try again in a few minutes.",
      };
    }
  } catch (error) {
    console.error("[auth] Password reset unexpected error:", error);
    return {
      success: false,
      error: friendlyClientError(
        error,
        "We could not send an access email. Please try again in a few minutes."
      ),
    };
  }

  return { success: true };
}

export async function updatePasswordAction(formData: FormData): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password) {
    return { success: false, error: "Password is required." };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { success: false, error: passwordError };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Your reset link has expired. Request a new password reset email.",
      };
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      logAuthEvent("password_reset.failed", {
        userId: user.id,
        email: user.email ?? null,
        reason: error.message,
      });
      return {
        success: false,
        error: "Could not save your new password. Request a new reset link and try again.",
      };
    }

    if (user.email) {
      const claimedCount = await claimUnclaimedPurchasesForEmail(user.id, user.email);
      if (claimedCount > 0) {
        logAuthEvent("purchase.linked", {
          userId: user.id,
          email: user.email,
          claimedCount,
          source: "password_update",
        });
      }
    }

    logAuthEvent("password_reset.completed", {
      userId: user.id,
      email: user.email ?? null,
    });

    await supabase.auth.signOut();
  } catch (error) {
    console.error("[auth] Password update unexpected error:", error);
    return {
      success: false,
      error: friendlyClientError(
        error,
        "Could not save your new password. Request a new reset link and try again."
      ),
    };
  }

  redirect(`${ROUTES.login}?reset=success`);
}

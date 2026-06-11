"use server";

import { redirect } from "next/navigation";
import {
  claimPurchaseByCheckoutSessionId,
  claimUnclaimedPurchasesForEmail,
} from "@/lib/auth/claim-purchase";
import { updateProfileFullName } from "@/lib/auth/profile-repository";
import { ROUTES } from "@/lib/constants";
import { getPurchaseByCheckoutSessionId } from "@/lib/purchase-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCheckoutSessionEmail,
  isValidCreatorDevelopmentPurchaseSession,
} from "@/lib/stripe-checkout-session";
import { getStripe, getSiteUrl } from "@/lib/stripe";

const MIN_PASSWORD_LENGTH = 8;

export type AuthActionResult =
  | { success: true }
  | { success: false; error: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validatePassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
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
      return {
        success: false,
        error: "This purchase is already linked to an account. Sign in instead.",
      };
    }

    const admin = getSupabaseAdmin();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createError || !created.user) {
      const message = createError?.message ?? "Could not create account.";
      const normalized = message.toLowerCase();
      if (
        normalized.includes("already") ||
        normalized.includes("registered") ||
        normalized.includes("exists")
      ) {
        return {
          success: false,
          error:
            "An account with this email already exists. Sign in with your password to access your dashboard and link this purchase.",
        };
      }
      return { success: false, error: message };
    }

    const userId = created.user.id;

    const claimResult = await claimPurchaseByCheckoutSessionId(userId, email, sessionId);
    if (!claimResult.claimed) {
      await admin.auth.admin.deleteUser(userId);
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
      return {
        success: false,
        error: "Account created but sign-in failed. Try signing in manually.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Registration failed.",
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
      return { success: false, error: "Invalid email or password." };
    }

    await claimUnclaimedPurchasesForEmail(data.user.id, email);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Sign-in failed.",
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

  try {
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(ROUTES.loginResetPassword)}`;
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      console.error("[auth] Password reset email failed:", error.message);
      return {
        success: false,
        error: "We could not send a reset email. Please try again in a few minutes.",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password reset request failed.",
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
      console.error("[auth] Password update failed:", error.message);
      return {
        success: false,
        error: "Could not save your new password. Request a new reset link and try again.",
      };
    }

    await supabase.auth.signOut();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Password update failed.",
    };
  }

  redirect(`${ROUTES.login}?reset=success`);
}

"use server";

import { redirect } from "next/navigation";
import {
  claimPurchaseByCheckoutSessionId,
  claimUnclaimedPurchasesForEmail,
} from "@/lib/auth/claim-purchase";
import { updateProfileFullName } from "@/lib/auth/profile-repository";
import { ROUTES } from "@/lib/constants";
import { sendPurchaseWelcomeEmail } from "@/lib/email/send-purchase-welcome";
import { getPurchaseByCheckoutSessionId } from "@/lib/purchase-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getCheckoutSessionEmail,
  isValidCreatorDevelopmentPurchaseSession,
} from "@/lib/stripe-checkout-session";
import { getStripe } from "@/lib/stripe";

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

async function waitForPurchase(stripeCheckoutSessionId: string, attempts = 5) {
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

  if (!email || !password || !sessionId) {
    return { success: false, error: "Email, password, and checkout session are required." };
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
      if (message.toLowerCase().includes("already")) {
        return {
          success: false,
          error: "An account with this email already exists. Sign in instead.",
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

    const purchase = await getPurchaseByCheckoutSessionId(sessionId);
    if (purchase) {
      void sendPurchaseWelcomeEmail({
        to: email,
        fullName: fullName || email,
        userId,
        purchaseId: purchase.id,
      });
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

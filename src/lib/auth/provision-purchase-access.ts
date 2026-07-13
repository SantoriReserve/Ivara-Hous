import { randomBytes } from "crypto";
import {
  hasAccountAccessEmailBeenSentForPurchase,
} from "@/lib/auth/access-email-guards";
import { logAuthEvent } from "@/lib/auth/auth-events";
import { claimPurchaseByCheckoutSessionId } from "@/lib/auth/claim-purchase";
import { findAuthUserByEmail } from "@/lib/auth/find-auth-user-by-email";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { sendPasswordSetupEmail } from "@/lib/auth/send-password-setup-email";
import type { PurchaseRecord } from "@/lib/purchase-schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ProvisionPurchaseAccessResult = {
  userId: string | null;
  createdUser: boolean;
  claimed: boolean;
  emailSent: boolean;
  emailSkipped: boolean;
  reason?: string;
};

export type ProvisionPurchaseAccessOptions = {
  /** Default true. Set false to only create/link without emailing. */
  sendEmail?: boolean;
  /**
   * Webhook mode: only email when a brand-new Auth user is created,
   * and never re-send if this purchase already got an access email.
   * Explicit forgot-password / resend should set forceEmail instead.
   */
  webhookIdempotent?: boolean;
  /** Always attempt to send (subject to recent-send rate limit in caller). */
  forceEmail?: boolean;
};

function createTemporaryPassword(): string {
  return `Tmp-${randomBytes(24).toString("base64url")}!9`;
}

/**
 * After a successful Stripe purchase:
 * 1. Ensure a Supabase Auth user exists for the checkout email
 * 2. Link the purchase (and assessment) to that user
 * 3. Optionally email a password-setup link via Resend
 */
export async function provisionPurchaseAccess(
  purchase: PurchaseRecord,
  options: ProvisionPurchaseAccessOptions = {}
): Promise<ProvisionPurchaseAccessResult> {
  const sendEmail = options.sendEmail !== false;
  const webhookIdempotent = options.webhookIdempotent === true;
  const forceEmail = options.forceEmail === true;
  const email = normalizeEmail(purchase.customerEmail);

  if (!email) {
    logAuthEvent("purchase.link_failed", {
      purchaseId: purchase.id,
      reason: "missing_email",
    });
    return {
      userId: null,
      createdUser: false,
      claimed: false,
      emailSent: false,
      emailSkipped: true,
      reason: "missing_email",
    };
  }

  try {
    let user = await findAuthUserByEmail(email);
    let createdUser = false;

    if (!user) {
      const admin = getSupabaseAdmin();
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password: createTemporaryPassword(),
        email_confirm: true,
        user_metadata: {
          source: "stripe_purchase",
          purchase_id: purchase.id,
        },
      });

      if (createError || !created.user) {
        const message = createError?.message ?? "createUser failed";
        const alreadyExists =
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("registered") ||
          message.toLowerCase().includes("exists");

        if (alreadyExists) {
          user = await findAuthUserByEmail(email);
          logAuthEvent("user.already_exists", {
            email,
            purchaseId: purchase.id,
            userId: user?.id ?? null,
          });
        }

        if (!user) {
          logAuthEvent("purchase.link_failed", {
            email,
            purchaseId: purchase.id,
            reason: "create_user_failed",
          });
          return {
            userId: null,
            createdUser: false,
            claimed: false,
            emailSent: false,
            emailSkipped: true,
            reason: "create_user_failed",
          };
        }
      } else {
        user = created.user;
        createdUser = true;
        logAuthEvent("user.provisioned", {
          userId: user.id,
          email,
          purchaseId: purchase.id,
          createdUser: true,
        });
      }
    } else {
      logAuthEvent("user.already_exists", {
        email,
        purchaseId: purchase.id,
        userId: user.id,
      });
    }

    let claimed = Boolean(purchase.userId && purchase.userId === user.id);

    if (!claimed) {
      const claimResult = await claimPurchaseByCheckoutSessionId(
        user.id,
        email,
        purchase.stripeCheckoutSessionId
      );
      claimed = claimResult.claimed;

      if (!claimed) {
        logAuthEvent("purchase.link_failed", {
          email,
          purchaseId: purchase.id,
          userId: user.id,
          reason: claimResult.reason ?? "claim_failed",
        });
        return {
          userId: user.id,
          createdUser,
          claimed: false,
          emailSent: false,
          emailSkipped: true,
          reason: claimResult.reason ?? "claim_failed",
        };
      }
    }

    logAuthEvent("purchase.linked", {
      email,
      purchaseId: purchase.id,
      userId: user.id,
      createdUser,
    });

    if (!sendEmail) {
      logAuthEvent("password_setup.email_skipped", {
        email,
        purchaseId: purchase.id,
        userId: user.id,
        reason: "email_skipped",
      });
      return {
        userId: user.id,
        createdUser,
        claimed: true,
        emailSent: false,
        emailSkipped: true,
        reason: "email_skipped",
      };
    }

    // Webhook retries / second purchases: do not spam setup emails.
    if (webhookIdempotent && !forceEmail) {
      if (!createdUser) {
        logAuthEvent("password_setup.email_skipped", {
          email,
          purchaseId: purchase.id,
          userId: user.id,
          reason: "existing_user",
        });
        return {
          userId: user.id,
          createdUser: false,
          claimed: true,
          emailSent: false,
          emailSkipped: true,
          reason: "existing_user_no_welcome_email",
        };
      }

      if (await hasAccountAccessEmailBeenSentForPurchase(purchase.id)) {
        logAuthEvent("password_setup.email_skipped", {
          email,
          purchaseId: purchase.id,
          userId: user.id,
          reason: "already_sent_for_purchase",
        });
        return {
          userId: user.id,
          createdUser: true,
          claimed: true,
          emailSent: false,
          emailSkipped: true,
          reason: "already_sent_for_purchase",
        };
      }
    }

    const emailResult = await sendPasswordSetupEmail({
      email,
      userId: user.id,
      purchaseId: purchase.id,
      purpose: createdUser && !forceEmail ? "setup" : forceEmail ? "setup" : "reset",
      // First automated welcome must not be blocked by an empty cooldown window race.
      ignoreRateLimit: webhookIdempotent && createdUser,
    });

    return {
      userId: user.id,
      createdUser,
      claimed: true,
      emailSent: emailResult.sent,
      emailSkipped: !emailResult.sent && emailResult.reason === "rate_limited",
      reason: emailResult.sent ? undefined : emailResult.reason,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "provision_failed";
    logAuthEvent("purchase.link_failed", {
      email,
      purchaseId: purchase.id,
      reason: message,
    });
    return {
      userId: null,
      createdUser: false,
      claimed: false,
      emailSent: false,
      emailSkipped: true,
      reason: message,
    };
  }
}

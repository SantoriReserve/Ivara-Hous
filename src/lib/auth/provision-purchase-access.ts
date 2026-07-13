import { randomBytes } from "crypto";
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
  reason?: string;
};

function createTemporaryPassword(): string {
  return `Tmp-${randomBytes(24).toString("base64url")}!9`;
}

/**
 * After a successful Stripe purchase:
 * 1. Ensure a Supabase Auth user exists for the checkout email
 * 2. Link the purchase (and assessment) to that user
 * 3. Email a password-setup / access link via Resend
 */
export async function provisionPurchaseAccess(
  purchase: PurchaseRecord,
  options: { sendEmail?: boolean } = {}
): Promise<ProvisionPurchaseAccessResult> {
  const sendEmail = options.sendEmail !== false;
  const email = normalizeEmail(purchase.customerEmail);

  if (!email) {
    console.error("[auth] provisionPurchaseAccess: missing customer email", {
      purchaseId: purchase.id,
    });
    return {
      userId: null,
      createdUser: false,
      claimed: false,
      emailSent: false,
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
        }

        if (!user) {
          console.error("[auth] Failed to create purchase access user:", {
            email,
            purchaseId: purchase.id,
            message,
          });
          return {
            userId: null,
            createdUser: false,
            claimed: false,
            emailSent: false,
            reason: message,
          };
        }
      } else {
        user = created.user;
        createdUser = true;
        console.log("[auth] Created Auth user for purchase:", {
          userId: user.id,
          email,
          purchaseId: purchase.id,
        });
      }
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
        console.error("[auth] Failed to claim purchase during provisioning:", {
          email,
          purchaseId: purchase.id,
          userId: user.id,
          reason: claimResult.reason,
        });
        return {
          userId: user.id,
          createdUser,
          claimed: false,
          emailSent: false,
          reason: claimResult.reason ?? "claim_failed",
        };
      }
    }

    if (!sendEmail) {
      return {
        userId: user.id,
        createdUser,
        claimed: true,
        emailSent: false,
        reason: "email_skipped",
      };
    }

    const emailResult = await sendPasswordSetupEmail({
      email,
      userId: user.id,
      purchaseId: purchase.id,
      purpose: createdUser ? "setup" : "reset",
    });

    return {
      userId: user.id,
      createdUser,
      claimed: true,
      emailSent: emailResult.sent,
      reason: emailResult.sent ? undefined : emailResult.reason,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "provision_failed";
    console.error("[auth] provisionPurchaseAccess error:", {
      email,
      purchaseId: purchase.id,
      message,
    });
    return {
      userId: null,
      createdUser: false,
      claimed: false,
      emailSent: false,
      reason: message,
    };
  }
}

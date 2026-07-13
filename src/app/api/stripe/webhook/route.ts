import { provisionPurchaseAccess } from "@/lib/auth/provision-purchase-access";
import { notifyOwnerPurchase } from "@/lib/email/owner-notifications";
import { saveCompletedPurchaseFromCheckoutSession } from "@/lib/purchase-repository";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

const HANDLED_EVENTS = ["checkout.session.completed"] as const;

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return new Response("Webhook is not configured", { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe/webhook] Signature verification failed:", error);
    return new Response("Invalid signature", { status: 400 });
  }

  if (!HANDLED_EVENTS.includes(event.type as (typeof HANDLED_EVENTS)[number])) {
    return new Response("Event ignored", { status: 200 });
  }

  try {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchase = await saveCompletedPurchaseFromCheckoutSession(session);

    if (!purchase) {
      console.warn("[stripe/webhook] Session ignored:", session.id);
      return new Response("Session ignored", { status: 200 });
    }

    console.log("[stripe/webhook] Purchase saved:", {
      purchaseId: purchase.id,
      stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
      assessmentId: purchase.assessmentId,
      customerEmail: purchase.customerEmail,
      amountCents: purchase.amountCents,
    });

    try {
      const provision = await provisionPurchaseAccess(purchase);
      console.log("[stripe/webhook] Purchase access provisioned:", {
        purchaseId: purchase.id,
        customerEmail: purchase.customerEmail,
        userId: provision.userId,
        createdUser: provision.createdUser,
        claimed: provision.claimed,
        emailSent: provision.emailSent,
        reason: provision.reason ?? null,
      });

      if (!provision.claimed || !provision.emailSent) {
        console.error("[stripe/webhook] Account provisioning incomplete:", provision);
      }
    } catch (provisionError) {
      console.error("[stripe/webhook] Account provisioning failed:", provisionError);
    }

    try {
      const ownerResult = await notifyOwnerPurchase(purchase);
      if (!ownerResult.sent && ownerResult.reason !== "duplicate") {
        console.warn("[stripe/webhook] Owner purchase notification skipped:", ownerResult.reason);
      }
    } catch (ownerNotificationError) {
      console.error("[stripe/webhook] Owner notification failed:", ownerNotificationError);
    }

    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("[stripe/webhook] Handler error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}

import type Stripe from "stripe";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";

export function isValidCreatorDevelopmentPurchaseSession(
  session: Stripe.Checkout.Session
): boolean {
  const isComplete = session.status === "complete";
  const isValidPaymentStatus =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";
  const currencyMatches =
    session.currency === CREATOR_DEVELOPMENT_PLAN_PRODUCT.currency;
  const productMatches =
    session.metadata?.productSlug === CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug;

  return isComplete && isValidPaymentStatus && currencyMatches && productMatches;
}

export function getCheckoutSessionEmail(session: Stripe.Checkout.Session): string | null {
  return session.customer_details?.email ?? session.customer_email ?? null;
}

export function getCheckoutSessionPaymentIntentId(
  session: Stripe.Checkout.Session
): string | null {
  const paymentIntent = session.payment_intent;
  if (!paymentIntent) {
    return null;
  }
  return typeof paymentIntent === "string" ? paymentIntent : paymentIntent.id;
}

export function getCheckoutSessionCustomerId(
  session: Stripe.Checkout.Session
): string | null {
  const customer = session.customer;
  if (!customer) {
    return null;
  }
  return typeof customer === "string" ? customer : customer.id;
}

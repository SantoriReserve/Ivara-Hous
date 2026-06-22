import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";

/** Server-only — do not import from middleware or client components. */
export function getCreatorDevelopmentPlanStripePriceId(): string {
  return process.env.STRIPE_PRICE_ID ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.stripePriceId;
}

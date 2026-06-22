export const CREATOR_DEVELOPMENT_PLAN_PRODUCT = {
  slug: "40-day-creator-development-plan",
  name: "40-Day Creator Development Plan",
  amountCents: 15000,
  currency: "usd",
  stripePriceId: "price_1Tl9tSB9ITza2mkkJQKtbXWr",
} as const;

export const CREATOR_DEVELOPMENT_PLAN_PRICE_LABEL = "$150" as const;

/** Stripe Price ID for CDS checkout — env override supported for deployment flexibility. */
export function getCreatorDevelopmentPlanStripePriceId(): string {
  return process.env.STRIPE_PRICE_ID ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.stripePriceId;
}

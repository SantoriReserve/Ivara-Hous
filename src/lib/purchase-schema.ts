export type PurchaseStatus = "completed" | "refunded";

export type PurchaseRecord = {
  id: string;
  userId: string | null;
  assessmentId: string | null;
  customerEmail: string;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  productSlug: string;
  amountCents: number;
  currency: string;
  status: PurchaseStatus;
  purchasedAt: string;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseInsert = {
  assessmentId: string | null;
  customerEmail: string;
  stripeCustomerId: string | null;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId: string | null;
  productSlug: string;
  amountCents: number;
  currency: string;
  status: PurchaseStatus;
  purchasedAt: string;
};

type PurchaseRow = {
  id: string;
  user_id: string | null;
  assessment_id: string | null;
  customer_email: string;
  stripe_customer_id: string | null;
  stripe_checkout_session_id: string;
  stripe_payment_intent_id: string | null;
  product_slug: string;
  amount_cents: number;
  currency: string;
  status: PurchaseStatus;
  purchased_at: string;
  claimed_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapPurchaseRow(row: PurchaseRow): PurchaseRecord {
  return {
    id: row.id,
    userId: row.user_id,
    assessmentId: row.assessment_id,
    customerEmail: row.customer_email,
    stripeCustomerId: row.stripe_customer_id,
    stripeCheckoutSessionId: row.stripe_checkout_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    productSlug: row.product_slug,
    amountCents: row.amount_cents,
    currency: row.currency,
    status: row.status,
    purchasedAt: row.purchased_at,
    claimedAt: row.claimed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPurchaseInsertRow(purchase: PurchaseInsert) {
  return {
    assessment_id: purchase.assessmentId,
    customer_email: purchase.customerEmail,
    stripe_customer_id: purchase.stripeCustomerId,
    stripe_checkout_session_id: purchase.stripeCheckoutSessionId,
    stripe_payment_intent_id: purchase.stripePaymentIntentId,
    product_slug: purchase.productSlug,
    amount_cents: purchase.amountCents,
    currency: purchase.currency,
    status: purchase.status,
    purchased_at: purchase.purchasedAt,
    updated_at: new Date().toISOString(),
  };
}

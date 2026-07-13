import type Stripe from "stripe";
import { logAuthEvent } from "@/lib/auth/auth-events";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import {
  getCheckoutSessionCustomerId,
  getCheckoutSessionEmail,
  getCheckoutSessionPaymentIntentId,
  isValidCreatorDevelopmentPurchaseSession,
} from "@/lib/stripe-checkout-session";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";
import {
  mapPurchaseRow,
  toPurchaseInsertRow,
  type PurchaseInsert,
  type PurchaseRecord,
} from "@/lib/purchase-schema";
import { getAssessmentById, updateAssessmentPaymentStatus } from "@/lib/assessment-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveAssessmentId(
  metadataAssessmentId: string | undefined
): Promise<string | null> {
  if (!metadataAssessmentId || !UUID_REGEX.test(metadataAssessmentId)) {
    return null;
  }

  const assessment = await getAssessmentById(metadataAssessmentId);
  return assessment ? metadataAssessmentId : null;
}

function buildPurchaseInsert(session: Stripe.Checkout.Session): PurchaseInsert | null {
  if (!isValidCreatorDevelopmentPurchaseSession(session)) {
    return null;
  }

  const customerEmail = getCheckoutSessionEmail(session);
  if (!customerEmail) {
    return null;
  }

  return {
    assessmentId: null,
    customerEmail: normalizeEmail(customerEmail),
    stripeCustomerId: getCheckoutSessionCustomerId(session),
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: getCheckoutSessionPaymentIntentId(session),
    productSlug:
      session.metadata?.productSlug ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug,
    amountCents: session.amount_total ?? 0,
    currency: session.currency ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.currency,
    status: "completed",
    purchasedAt: new Date((session.created ?? Date.now() / 1000) * 1000).toISOString(),
  };
}

/**
 * Idempotent purchase save keyed by Stripe checkout session id.
 * Retries never create a second row or clear an existing user_id claim.
 */
export async function saveCompletedPurchaseFromCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<PurchaseRecord | null> {
  const purchaseInsert = buildPurchaseInsert(session);
  if (!purchaseInsert) {
    return null;
  }

  const metadataAssessmentId = session.metadata?.assessmentId;
  const assessmentId = await resolveAssessmentId(metadataAssessmentId);
  purchaseInsert.assessmentId = assessmentId;

  const existing = await getPurchaseByCheckoutSessionId(session.id);
  if (existing) {
    if (assessmentId) {
      await updateAssessmentPaymentStatus(assessmentId, "paid");
    }
    logAuthEvent("purchase.duplicate_ignored", {
      purchaseId: existing.id,
      stripeCheckoutSessionId: session.id,
      customerEmail: existing.customerEmail,
      userId: existing.userId,
    });
    return existing;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("purchases")
    .insert(toPurchaseInsertRow(purchaseInsert))
    .select("*")
    .single();

  if (error) {
    // Race: another webhook retry inserted first.
    if (error.code === "23505") {
      const raced = await getPurchaseByCheckoutSessionId(session.id);
      if (raced) {
        logAuthEvent("purchase.duplicate_ignored", {
          purchaseId: raced.id,
          stripeCheckoutSessionId: session.id,
          customerEmail: raced.customerEmail,
          userId: raced.userId,
          race: true,
        });
        return raced;
      }
    }
    throw new Error(`Failed to save purchase: ${error.message}`);
  }

  if (assessmentId) {
    await updateAssessmentPaymentStatus(assessmentId, "paid");
  }

  const purchase = mapPurchaseRow(data);
  logAuthEvent("purchase.received", {
    purchaseId: purchase.id,
    stripeCheckoutSessionId: purchase.stripeCheckoutSessionId,
    customerEmail: purchase.customerEmail,
    amountCents: purchase.amountCents,
    assessmentId: purchase.assessmentId,
  });

  return purchase;
}

export async function getPurchaseByCheckoutSessionId(
  stripeCheckoutSessionId: string
): Promise<PurchaseRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("stripe_checkout_session_id", stripeCheckoutSessionId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load purchase: ${error.message}`);
  }

  return data ? mapPurchaseRow(data) : null;
}

export async function getActivePurchaseForUser(
  userId: string
): Promise<PurchaseRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("user_id", userId)
    .eq("product_slug", CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user purchase: ${error.message}`);
  }

  return data ? mapPurchaseRow(data) : null;
}

export async function getCompletedPurchasesByEmail(
  email: string
): Promise<PurchaseRecord[]> {
  const supabase = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .eq("status", "completed")
    .eq("product_slug", CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug)
    .order("purchased_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load purchases by email: ${error.message}`);
  }

  return (data ?? [])
    .map(mapPurchaseRow)
    .filter((purchase) => normalizeEmail(purchase.customerEmail) === normalized);
}

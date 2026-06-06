import type Stripe from "stripe";
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
    customerEmail,
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

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("purchases")
    .upsert(toPurchaseInsertRow(purchaseInsert), {
      onConflict: "stripe_checkout_session_id",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to save purchase: ${error.message}`);
  }

  if (assessmentId) {
    await updateAssessmentPaymentStatus(assessmentId, "paid");
  }

  return mapPurchaseRow(data);
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

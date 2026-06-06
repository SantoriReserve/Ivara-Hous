import { apiError, apiSuccess } from "@/lib/api-response";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";
import { getSiteUrl, getStripe } from "@/lib/stripe";
import { ROUTES } from "@/lib/constants";

type CheckoutRequestBody = {
  assessmentId?: string;
  customerEmail?: string;
};

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return apiError("Checkout is not configured.", 500);
    }

    const body = (await request.json().catch(() => ({}))) as CheckoutRequestBody;
    const assessmentId =
      typeof body.assessmentId === "string" && body.assessmentId.length > 0
        ? body.assessmentId
        : undefined;
    const customerEmail =
      typeof body.customerEmail === "string" && body.customerEmail.includes("@")
        ? body.customerEmail
        : undefined;

    const stripe = getStripe();
    const siteUrl = getSiteUrl().replace(/\/$/, "");

    const metadata: Record<string, string> = {
      productSlug: CREATOR_DEVELOPMENT_PLAN_PRODUCT.slug,
    };

    if (assessmentId) {
      metadata.assessmentId = assessmentId;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      metadata,
      success_url: `${siteUrl}${ROUTES.creatorDevelopmentPlanSuccess}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}${ROUTES.creatorDevelopmentPlanCancel}`,
    });

    if (!session.url) {
      return apiError("Could not start checkout.", 500);
    }

    return apiSuccess({ url: session.url });
  } catch (error) {
    console.error("[stripe/checkout] Error:", error);
    return apiError("Could not start checkout. Please try again.", 500);
  }
}

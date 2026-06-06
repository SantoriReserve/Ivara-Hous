import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";
import { getStripe } from "@/lib/stripe";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Purchase Confirmed",
  description: "Your 40-Day Creator Development Plan purchase is confirmed.",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

function formatAmount(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountCents / 100);
}

export default async function CreatorDevelopmentPlanSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <ConfirmationLayout
        title="Payment Confirmation Unavailable"
        description="We could not verify your checkout session. If you completed payment, check your email for a receipt from Stripe."
        error
      />
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const isPaid = session.payment_status === "paid";
    const amountMatches =
      session.amount_total === CREATOR_DEVELOPMENT_PLAN_PRODUCT.amountCents;
    const currencyMatches =
      session.currency === CREATOR_DEVELOPMENT_PLAN_PRODUCT.currency;

    if (!isPaid || !amountMatches || !currencyMatches) {
      return (
        <ConfirmationLayout
          title="Payment Not Confirmed"
          description="Your payment has not been confirmed yet. If you believe this is an error, contact support with your Stripe receipt."
          error
        />
      );
    }

    const customerEmail =
      session.customer_details?.email ?? session.customer_email ?? null;
    const amountLabel = formatAmount(
      session.amount_total ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.amountCents,
      session.currency ?? CREATOR_DEVELOPMENT_PLAN_PRODUCT.currency
    );

    return (
      <ConfirmationLayout
        title="Purchase Confirmed"
        description="Your 40-Day Creator Development Plan is confirmed. Your personalized creator development system will be available in your dashboard in a future release."
      >
        <dl className="mx-auto mt-12 max-w-md space-y-6 text-left">
          <div>
            <dt className="luxury-label mb-2 text-white/50">Product</dt>
            <dd className="font-sans text-sm text-white">
              {CREATOR_DEVELOPMENT_PLAN_PRODUCT.name}
            </dd>
          </div>
          <div>
            <dt className="luxury-label mb-2 text-white/50">Amount Paid</dt>
            <dd className="font-serif text-2xl font-normal tracking-tight text-white">
              {amountLabel}
            </dd>
          </div>
          {customerEmail && (
            <div>
              <dt className="luxury-label mb-2 text-white/50">Confirmation Email</dt>
              <dd className="font-sans text-sm text-white">{customerEmail}</dd>
            </div>
          )}
        </dl>
      </ConfirmationLayout>
    );
  } catch (error) {
    console.error("[plan/success] Error:", error);
    return (
      <ConfirmationLayout
        title="Payment Confirmation Unavailable"
        description="We could not verify your checkout session. If you completed payment, check your email for a receipt from Stripe."
        error
      />
    );
  }
}

function ConfirmationLayout({
  title,
  description,
  children,
  error = false,
}: {
  title: string;
  description: string;
  children?: ReactNode;
  error?: boolean;
}) {
  return (
    <>
      <PageHero
        label={error ? "Checkout" : "Purchase Confirmed"}
        title={title}
        description={description}
        dark
      />
      <section className="border-t border-black/10 bg-black py-section text-white sm:py-section-lg">
        <div className="luxury-container max-w-3xl text-center">
          {children}
          <div className="mt-12">
            <Button
              href={ROUTES.creatorDevelopmentPlan}
              variant="secondary"
              size="lg"
            >
              Return To Plan Overview
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

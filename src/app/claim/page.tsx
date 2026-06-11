import type { Metadata } from "next";
import Link from "next/link";
import { PasswordAuthForm } from "@/components/auth/PasswordAuthForm";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { getPurchaseByCheckoutSessionId } from "@/lib/purchase-repository";
import {
  getCheckoutSessionEmail,
  isValidCreatorDevelopmentPurchaseSession,
} from "@/lib/stripe-checkout-session";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Ivara Hous creator dashboard account after purchase.",
};

type ClaimPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return (
      <>
        <PageHero
          label="Create Account"
          title="Checkout Session Required"
          description="Start from your purchase confirmation page to create your dashboard account."
        />
        <section className="py-section text-center sm:py-section-md lg:py-section-xl">
          <div className="luxury-container">
            <Button href={ROUTES.creatorDevelopmentPlan} variant="primary" size="lg">
              Return To Plan Overview
            </Button>
          </div>
        </section>
      </>
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!isValidCreatorDevelopmentPurchaseSession(session)) {
      return (
        <>
          <PageHero
            label="Create Account"
            title="Purchase Not Confirmed"
            description="We could not verify your checkout session. Complete payment first, then return here from your confirmation page."
          />
          <section className="py-section text-center sm:py-section-md lg:py-section-xl">
            <div className="luxury-container">
              <Button href={ROUTES.creatorDevelopmentPlan} variant="primary" size="lg">
                Return To Plan Overview
              </Button>
            </div>
          </section>
        </>
      );
    }

    const customerEmail = getCheckoutSessionEmail(session);
    const purchase = await getPurchaseByCheckoutSessionId(sessionId);

    if (!customerEmail) {
      return (
        <>
          <PageHero
            label="Create Account"
            title="Email Required"
            description="We could not find an email on your checkout session. Contact support with your Stripe receipt."
          />
        </>
      );
    }

    if (purchase?.userId) {
      return (
        <>
          <PageHero
            label="Create Account"
            title="Account Already Linked"
            description="This purchase is already connected to a dashboard account. Sign in to continue."
          />
          <section className="py-section text-center sm:py-section-md lg:py-section-xl">
            <div className="luxury-container">
              <Button href={ROUTES.login} variant="primary" size="lg">
                Sign In
              </Button>
            </div>
          </section>
        </>
      );
    }

    return (
      <>
        <PageHero
          label="Create Account"
          title="Access Your Dashboard"
          description="Create your account with the same email from checkout. You will be signed in and taken directly to your dashboard."
        />
        <section className="py-section sm:py-section-md lg:py-section-xl">
          <div className="luxury-container">
            <PasswordAuthForm
              mode="register"
              sessionId={sessionId}
              defaultEmail={customerEmail}
              title="Create Your Account"
              description="Use your checkout email and choose a password. Your dashboard will open immediately — no email confirmation required."
              submitLabel="Create Account"
            />
            <p className="mx-auto mt-10 max-w-md text-center font-sans text-sm text-gray-mid">
              Already have an account?{" "}
              <Link href={ROUTES.login} className="text-black underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </>
    );
  } catch (error) {
    console.error("[claim] Error:", error);
    return (
      <>
        <PageHero
          label="Create Account"
          title="Something Went Wrong"
          description="We could not load your purchase details. Try again from your confirmation page."
        />
      </>
    );
  }
}

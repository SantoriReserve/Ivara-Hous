"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { Button } from "@/components/ui/Button";
import { readCreatorDevAssessmentSession } from "@/lib/creator-dev-assessment-session";
import { ROUTES } from "@/lib/constants";
import { CREATOR_DEVELOPMENT_PLAN_PRICE_LABEL } from "@/lib/stripe-product";

export function PlanPurchaseSection() {
  const searchParams = useSearchParams();

  const { assessmentId, customerEmail } = useMemo(() => {
    const fromUrl = searchParams.get("assessmentId");
    const stored = readCreatorDevAssessmentSession();

    return {
      assessmentId: fromUrl ?? stored?.assessmentId,
      customerEmail: stored?.customerEmail,
    };
  }, [searchParams]);

  return (
    <section
      id="purchase"
      className="border-t border-black/10 bg-black py-section text-white sm:py-section-md lg:py-section-xl"
    >
      <div className="luxury-container max-w-3xl text-center">
        <p className="luxury-label mb-5 text-white/50">Ready To Begin</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
          Unlock Your 40-Day Creator Development Plan
        </h2>
        <p className="mx-auto mt-8 max-w-lg text-sm leading-[1.85] text-white/65">
          One-time purchase. Instant dashboard access. A personalized 40-day
          action system delivered to your account and inbox — built from your
          assessment and ready to execute from Day 1.
        </p>
        <p className="mt-8 font-serif text-4xl font-normal tracking-tight">
          {CREATOR_DEVELOPMENT_PLAN_PRICE_LABEL}
        </p>
        <div className="mt-10 flex justify-center">
          <CheckoutButton
            assessmentId={assessmentId}
            customerEmail={customerEmail}
            variant="secondary"
            size="lg"
            className="w-full max-w-md sm:w-auto"
          />
        </div>
        <p className="mt-8 font-sans text-[10px] uppercase tracking-nav text-white/40">
          Secure checkout via Stripe
        </p>
        <p className="mt-6 flex justify-center">
          <Button
            href={ROUTES.creatorDevelopment}
            variant="outline"
            size="md"
            className="w-full max-w-md border-white text-white hover:bg-white hover:text-black sm:w-auto"
          >
            Take The Assessment First
          </Button>
        </p>
      </div>
    </section>
  );
}

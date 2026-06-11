"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { readCreatorDevAssessmentSession } from "@/lib/creator-dev-assessment-session";
import { ROUTES } from "@/lib/constants";

export function CreatorDevelopmentPlanCancelContent() {
  const searchParams = useSearchParams();

  const planHref = useMemo(() => {
    const fromUrl = searchParams.get("assessmentId");
    const stored = readCreatorDevAssessmentSession();
    const assessmentId = fromUrl ?? stored?.assessmentId;

    if (!assessmentId) {
      return ROUTES.creatorDevelopmentPlan;
    }

    return `${ROUTES.creatorDevelopmentPlan}?assessmentId=${encodeURIComponent(assessmentId)}`;
  }, [searchParams]);

  return (
    <>
      <PageHero
        label="Checkout"
        title="Payment Not Completed"
        description="Your checkout was cancelled and no charge was made. You can return to the plan page whenever you are ready to purchase."
        dark
      />
      <section className="border-t border-black/10 bg-black py-section text-white sm:py-section-md lg:py-section-xl">
        <div className="luxury-container max-w-3xl text-center">
          <Button href={planHref} variant="secondary" size="lg">
            Return To Plan Page
          </Button>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Creator Development",
  description:
    "Take the Ivara Hous creator development assessment and discover your readiness scores.",
};

export default function CreatorDevelopmentPage() {
  return (
    <>
      <PageHero
        label="Creator Development"
        title="Creator Development Assessment"
        description="A multi-step assessment to evaluate your creator readiness, portfolio strength, and partnership potential within the luxury travel space."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-2xl">
          <AssessmentForm />
        </div>
      </section>
    </>
  );
}

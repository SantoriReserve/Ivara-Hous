import type { Metadata } from "next";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Creator Development System",
  description:
    "Take the Ivara Hous Creator Development assessment and receive a complimentary preview of your personalized creator evaluation.",
};

export default function CreatorDevelopmentPage() {
  return (
    <>
      <PageHero
        label="Creator Development"
        title="Creator Development Assessment"
        description="A strategic assessment for aspiring travel creators — evaluate your positioning, portfolio strength, and partnership potential, then receive a complimentary preview of your personalized evaluation."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-2xl">
          <AssessmentForm />
        </div>
      </section>
    </>
  );
}

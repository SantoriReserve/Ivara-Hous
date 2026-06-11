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
      <section className="overflow-x-hidden py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container max-w-2xl px-6 sm:px-10">
          <AssessmentForm />
        </div>
      </section>
    </>
  );
}

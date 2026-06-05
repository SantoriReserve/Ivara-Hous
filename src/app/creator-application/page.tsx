import type { Metadata } from "next";
import { CreatorApplicationForm } from "@/components/forms/CreatorApplicationForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Travel Creator Roster",
  description: "Apply to join the Ivara Hous Travel Creator Roster.",
};

export default function CreatorApplicationPage() {
  return (
    <>
      <PageHero
        label="Travel Creator Roster"
        title="Apply to Join the Creator Roster"
        description="Gain access to paid travel partnerships, hosted stays, and luxury hospitality campaigns — with no fees, exclusivity, or contracts. Creators remain fully independent."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-3xl">
          <CreatorApplicationForm />
        </div>
      </section>
    </>
  );
}

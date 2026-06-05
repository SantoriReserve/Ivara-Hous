import type { Metadata } from "next";
import { CreatorApplicationForm } from "@/components/forms/CreatorApplicationForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Creator Application",
  description: "Apply to join the Ivara Hous creator network.",
};

export default function CreatorApplicationPage() {
  return (
    <>
      <PageHero
        label="Creators"
        title="Creator Application"
        description="Join our curated network of travel creators delivering editorial-quality content for luxury properties and brands worldwide."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-3xl">
          <CreatorApplicationForm />
        </div>
      </section>
    </>
  );
}

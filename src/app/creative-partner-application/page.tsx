import type { Metadata } from "next";
import { CreativePartnerForm } from "@/components/forms/CreativePartnerForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Creative Partner Application",
  description: "Apply to join the Ivara Hous creative partner roster.",
};

export default function CreativePartnerApplicationPage() {
  return (
    <>
      <PageHero
        label="Creative Partners"
        title="Creative Partner Application"
        description="Photographers, videographers, production teams, and editors — join our vetted roster serving luxury travel and hospitality clients."
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container max-w-3xl">
          <CreativePartnerForm />
        </div>
      </section>
    </>
  );
}

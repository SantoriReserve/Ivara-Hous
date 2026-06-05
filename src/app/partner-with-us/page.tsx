import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Partner With Us",
  description: "Partner with Ivara Hous for luxury hospitality growth and creator collaborations.",
};

export default function PartnerWithUsPage() {
  return (
    <>
      <PageHero
        label="Partners"
        title="Partner With Ivara Hous"
        description="Luxury hotels, villas, resorts, and hospitality brands — connect with our creator network, travel referrals, and strategic growth partnerships."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-3xl">
          <PartnerForm />
        </div>
      </section>
    </>
  );
}

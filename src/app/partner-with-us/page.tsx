import type { Metadata } from "next";
import { PartnerForm } from "@/components/forms/PartnerForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Partner With Us",
  description: "Partner with Ivara Hous as a Hospitality Growth Partner or for Creator Partnership Management.",
};

export default function PartnerWithUsPage() {
  return (
    <>
      <PageHero
        label="Partners"
        title="Partner With Ivara Hous"
        description="Luxury hotels, villas, resorts, and hospitality brands — explore Creator Partnership Management, Hospitality Growth Partner opportunities, strategic introductions, and long-term visibility."
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container max-w-3xl">
          <PartnerForm />
        </div>
      </section>
    </>
  );
}

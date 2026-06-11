import type { Metadata } from "next";
import { AssessmentPreview } from "@/components/home/AssessmentPreview";
import { CreatorDevelopmentPlan } from "@/components/home/CreatorDevelopmentPlan";
import { CreatorNetwork } from "@/components/home/CreatorNetwork";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { PartnerWithUs } from "@/components/home/PartnerWithUs";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { TravelCoordination } from "@/components/home/TravelCoordination";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description:
    "Ivara Hous is a luxury travel agency connecting creators, luxury properties, travelers, and creative partners.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <AssessmentPreview />
      <CreatorDevelopmentPlan />
      <ServicesOverview />
      <CreatorNetwork />
      <TravelCoordination />
      <PartnerWithUs />
      <FinalCta />
    </>
  );
}

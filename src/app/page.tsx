import { AssessmentPreview } from "@/components/home/AssessmentPreview";
import { CreatorNetwork } from "@/components/home/CreatorNetwork";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { Intro } from "@/components/home/Intro";
import { PartnerWithUs } from "@/components/home/PartnerWithUs";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { TravelCoordination } from "@/components/home/TravelCoordination";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <AssessmentPreview />
      <ServicesOverview />
      <CreatorNetwork />
      <TravelCoordination />
      <PartnerWithUs />
      <FinalCta />
    </>
  );
}

import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

export function CreatorNetwork() {
  return (
    <section className="border-t border-black/10 bg-white py-section sm:py-section-lg">
      <div className="luxury-container">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="grid grid-cols-2 gap-5 lg:order-1">
            <LuxuryImage
              image={SITE_IMAGES.creatorYacht}
              aspectRatio="square"
              className="border border-black/10"
            />
            <LuxuryImage
              image={SITE_IMAGES.creatorLifestyle}
              aspectRatio="square"
              className="mt-12 border border-black/10"
            />
          </div>
          <div className="lg:order-2">
            <SectionHeading
              label="Travel Creator Roster"
              title="Paid Partnerships Without Fees or Exclusivity"
              description="Join the Ivara Hous Creator Roster for paid travel partnerships, hosted stays, and luxury hospitality campaigns — with full independence, no membership fees, and support from outreach through deliverables."
            />
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Button href={ROUTES.creatorApplication} variant="primary" size="lg">
                Apply As A Creator
              </Button>
              <Button href={ROUTES.creativePartnerApplication} variant="outline" size="lg">
                Creative Partner
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

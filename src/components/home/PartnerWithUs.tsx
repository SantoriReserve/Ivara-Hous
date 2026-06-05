import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

export function PartnerWithUs() {
  return (
    <section
      id="partner-with-us"
      className="border-t border-black/10 bg-white py-section sm:py-section-lg"
    >
      <div className="luxury-container">
        <div className="grid items-center gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <p className="luxury-label mb-5">Partnerships</p>
            <h2 className="luxury-heading text-3xl sm:text-4xl lg:text-[2.75rem]">
              Partner With Ivara Hous
            </h2>
            <p className="luxury-body-lg mt-8">
              Supporting luxury properties, travel brands, resorts, villas,
              charters, and hospitality partners through creator partnerships,
              strategic introductions, and luxury travel opportunities.
            </p>
            <Button
              href={ROUTES.partnerWithUs}
              variant="primary"
              size="lg"
              className="mt-12"
            >
              Partner With Us
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:col-span-7 lg:gap-5">
            <LuxuryImage
              image={SITE_IMAGES.partnerAirelles}
              aspectRatio="portrait"
              className="border border-black/10"
            />
            <LuxuryImage
              image={SITE_IMAGES.partnerVilla}
              aspectRatio="portrait"
              className="mt-10 border border-black/10 sm:mt-14"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

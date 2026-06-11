import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

const features = [
  "Brand trips & creator trips",
  "Retreats & corporate travel experiences",
  "Luxury group travel & hosted experiences",
  "Elevated travel planning & execution",
];

export function TravelCoordination() {
  return (
    <section className="py-section sm:py-section-md lg:py-section-xl">
      <div className="luxury-container">
        <LuxuryImage
          image={SITE_IMAGES.travelCoordination}
          aspectRatio="wide"
          className="mb-20 border border-black/10"
        />
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <SectionHeading
              label="Luxury Travel"
              title="Luxury Travel Coordination"
              description="Premium planning and coordination for elevated travel experiences. We handle logistics, accommodations, itineraries, and trusted providers — not a 24/7 concierge or lifestyle management service."
            />
            <Button
              href={`${ROUTES.services}#luxury-travel-coordination`}
              variant="outline"
              size="md"
              className="mt-8"
            >
              View Service
            </Button>
          </div>
          <ul className="space-y-0 lg:pt-4">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-8 border-b border-black/10 py-7 font-sans text-base text-black last:border-b-0"
              >
                <span className="font-serif text-xl text-gray-muted">—</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

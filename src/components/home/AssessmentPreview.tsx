import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

const highlights = [
  "Creator Readiness Score",
  "Portfolio & Content Analysis",
  "Partnership Potential Insights",
  "40-Day Personalized Development Plan — $95",
];

export function AssessmentPreview() {
  return (
    <section className="border-y border-black/10 bg-gray-light py-section sm:py-section-lg">
      <div className="luxury-container">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <LuxuryImage
            image={SITE_IMAGES.assessment}
            aspectRatio="portrait"
            className="border border-black/10"
          />
          <div>
            <SectionHeading
              label="Creator Development"
              title="Discover Your Creator Readiness"
              description="A multi-step assessment delivering personalized scores across portfolio strength, content quality, partnership potential, and luxury travel alignment."
            />
            <ul className="mt-12 space-y-5">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-5 font-sans text-sm text-black"
                >
                  <span className="mt-2.5 h-px w-8 shrink-0 bg-black" />
                  {item}
                </li>
              ))}
            </ul>
            <Button
              href={ROUTES.creatorDevelopment}
              variant="primary"
              size="lg"
              className="mt-12"
            >
              Begin Assessment
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

const highlights = [
  "Free personalized assessment preview",
  "Positioning & brand strategy",
  "40-day customized growth plan",
  "Personalized creator dashboard",
];

export function AssessmentPreview() {
  return (
    <section className="border-y border-black/10 bg-gray-light py-section sm:py-section-md lg:py-section-xl">
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
              title="Creator Development System"
              description="An AI-powered program helping aspiring travel creators build professional portfolios, strengthen positioning, and become partnership-ready — beginning with a strategic assessment and complimentary evaluation preview."
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
            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <Button
                href={ROUTES.creatorDevelopmentPlan}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
              >
                View Development Plan
              </Button>
              <Button
                href={ROUTES.creatorDevelopment}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                Take Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

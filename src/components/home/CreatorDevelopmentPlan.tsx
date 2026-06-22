import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { CREATOR_DEVELOPMENT_PLAN_PRICE_LABEL } from "@/lib/stripe-product";

const benefits = [
  "Personalized dashboard",
  "Daily action plan",
  "Portfolio development",
  "Partnership outreach templates",
  "Creator positioning strategy",
  "Resources and tools",
  "Instant access",
];

export function CreatorDevelopmentPlan() {
  return (
    <section className="border-y border-black/10 bg-white py-section sm:py-section-md lg:py-section-xl">
      <div className="luxury-container">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            label="Flagship Digital Product"
            title="40-Day Creator Development Plan"
            description="A personalized creator growth system designed to help travel, lifestyle, hospitality, and luxury creators build a portfolio, secure partnerships, position themselves professionally, and prepare for paid opportunities."
            align="center"
          />
          <p className="mt-8 font-serif text-5xl font-normal tracking-tight text-black">
            {CREATOR_DEVELOPMENT_PLAN_PRICE_LABEL}
          </p>
          <ul className="mx-auto mt-12 max-w-xl space-y-4 text-left">
            {benefits.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 font-sans text-sm text-black"
              >
                <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
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
    </section>
  );
}

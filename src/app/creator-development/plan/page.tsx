import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "40-Day Creator Development Plan",
  description:
    "A personalized, automated 40-Day Creator Development Plan — dashboard access, daily action steps, content strategy, and outreach resources built from your assessment results.",
};

const INCLUDED = [
  "Personalized 40-Day Creator Development Dashboard",
  "Daily action plan customized to your assessment results",
  "Personalized content strategy",
  "Content calendar and content ideas",
  "Portfolio development roadmap",
  "Hotel and hospitality outreach recommendations",
  "Outreach templates and pitch resources",
  "Creator growth tracking and progress dashboard",
  "Recommended next actions based on creator stage",
  "Personalized Creator Development Plan delivered by email for your records",
  "Instant access after purchase",
];

const FLOW = [
  "Assessment complete",
  "Learn more about the 40-Day Creator Development Plan",
  "Dedicated product information page",
  "Purchase",
  "Create account",
  "Instant access to dashboard",
  "Personalized plan delivered by email",
  "Begin Day 1 immediately",
];

export default function CreatorDevelopmentPlanPage() {
  return (
    <>
      <PageHero
        label="Creator Development"
        title="40-Day Creator Development Plan"
        description="A premium, automated digital product built from your assessment results — delivering a personalized dashboard, daily action plan, and creator growth system you can begin the moment you purchase."
      />

      <section className="py-section sm:py-section-lg">
        <div className="luxury-container max-w-3xl">
          <p className="luxury-label mb-5">What You Receive</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
            Everything Included In Your Plan
          </h2>
          <p className="luxury-body-lg mt-8">
            Your 40-Day Creator Development Plan is generated from your assessment
            data and delivered as a complete, results-focused growth system — not a
            manual service or onboarding process. Purchase once and begin building
            immediately.
          </p>
          <ul className="mt-12 space-y-4">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 font-sans text-sm text-black"
              >
                <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-black/10 bg-gray-light py-section sm:py-section-lg">
        <div className="luxury-container max-w-3xl">
          <p className="luxury-label mb-5">How It Works</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
            From Purchase To Day 1
          </h2>
          <p className="luxury-body-lg mt-8">
            A streamlined digital experience designed for creators who want clarity,
            momentum, and measurable progress — without waiting on manual follow-up.
          </p>
          <ol className="mt-12 space-y-6">
            {FLOW.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-6 font-sans text-sm text-black"
              >
                <span className="luxury-label shrink-0 pt-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="purchase"
        className="border-t border-black/10 bg-black py-section text-white sm:py-section-lg"
      >
        <div className="luxury-container max-w-3xl text-center">
          <p className="luxury-label mb-5 text-white/50">Ready To Begin</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Unlock Your 40-Day Creator Development Plan
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-sm leading-[1.85] text-white/65">
            One-time purchase. Instant dashboard access. A personalized 40-day
            action system delivered to your account and inbox — built from your
            assessment and ready to execute from Day 1.
          </p>
          <p className="mt-8 font-serif text-4xl font-normal tracking-tight">$95</p>
          <Button variant="secondary" size="lg" className="mt-10">
            Unlock Your 40-Day Creator Development Plan
          </Button>
          <p className="mt-8 font-sans text-[10px] uppercase tracking-nav text-white/40">
            Secure checkout via Stripe — launching soon
          </p>
          <p className="mt-6">
            <Button
              href={ROUTES.creatorDevelopment}
              variant="outline"
              size="md"
              className="border-white text-white hover:bg-white hover:text-black"
            >
              Take The Assessment First
            </Button>
          </p>
        </div>
      </section>
    </>
  );
}

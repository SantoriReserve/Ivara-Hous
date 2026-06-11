import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { SERVICE_IMAGES } from "@/lib/images";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore Ivara Hous services — Creator Development System, Travel Creator Roster, Creator Partnership Management, Hospitality Growth Partner, Luxury Travel Coordination, and Content & Creative Partnerships.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        label="Services"
        title="Six Pillars of the Ivara Hous Platform"
        description="From creator development and roster opportunities to partnership management, hospitality growth, travel coordination, and creative partnerships — every service is designed for luxury, clarity, and measurable impact."
      />

      <section className="border-b border-black/10 bg-gray-light py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container">
          <article
            id="creator-development-plan"
            className="scroll-mt-28 grid items-start gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <div className="min-w-0">
              <span className="luxury-label">Featured Digital Product</span>
              <h2 className="mt-6 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
                40-Day Creator Development Plan
              </h2>
              <p className="luxury-body-lg mt-8">
                A personalized creator growth system with instant dashboard access,
                daily action steps, portfolio development, partnership outreach
                templates, and creator positioning strategy — built from your
                assessment results.
              </p>
              <p className="mt-8 font-serif text-4xl font-normal tracking-tight text-black">
                $95
              </p>
              <ul className="mt-10 space-y-4">
                {[
                  "Personalized dashboard",
                  "Daily action plan",
                  "Portfolio development",
                  "Partnership outreach templates",
                  "Creator positioning strategy",
                  "Resources and tools",
                  "Instant access",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-4 font-sans text-sm text-black"
                  >
                    <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button
                  href={ROUTES.creatorDevelopmentPlan}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  View Development Plan
                </Button>
                <Button
                  href={ROUTES.creatorDevelopment}
                  variant="outline"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  Take Assessment
                </Button>
              </div>
            </div>
            <div className="border border-black/10 bg-white p-8 sm:p-10">
              <p className="luxury-label mb-4">How It Works</p>
              <ol className="space-y-5 font-sans text-sm text-gray-mid">
                <li>1. Take the free creator assessment (optional but recommended)</li>
                <li>2. Purchase the 40-Day Creator Development Plan</li>
                <li>3. Create your account and access your dashboard instantly</li>
                <li>4. Begin Day 1 with personalized daily actions</li>
              </ol>
            </div>
          </article>
        </div>
      </section>

      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container space-y-28 sm:space-y-36">
          {SERVICES.map((service, index) => {
            const image = SERVICE_IMAGES[service.id];
            return (
              <article
                key={service.id}
                id={service.id}
                className="scroll-mt-28 grid items-start gap-16 lg:grid-cols-2 lg:gap-24"
              >
                <div className={index % 2 === 1 ? "lg:order-2 lg:pt-4" : "lg:pt-4"}>
                  <span className="luxury-label">{String(index + 1).padStart(2, "0")}</span>
                  <h2 className="mt-6 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="luxury-body-lg mt-8">{service.description}</p>
                  <ul className="mt-10 space-y-4">
                    {service.highlights.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-4 font-sans text-sm text-black"
                      >
                        <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  {service.id === "creator-development" && (
                    <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                      <Button
                        href={ROUTES.creatorDevelopmentPlan}
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto"
                      >
                        View Development Plan
                      </Button>
                      <Button
                        href={ROUTES.creatorDevelopment}
                        variant="outline"
                        size="md"
                        className="w-full sm:w-auto"
                      >
                        Take Assessment
                      </Button>
                    </div>
                  )}
                  {service.id === "travel-creator-roster" && (
                    <Button
                      href={ROUTES.creatorApplication}
                      variant="outline"
                      size="md"
                      className="mt-10"
                    >
                      Apply to Join
                    </Button>
                  )}
                  {service.id === "creator-partnership-management" && (
                    <Button href={ROUTES.contact} variant="outline" size="md" className="mt-10">
                      Learn More
                    </Button>
                  )}
                  {service.id === "hospitality-growth-partner" && (
                    <Button href={ROUTES.partnerWithUs} variant="outline" size="md" className="mt-10">
                      Partner With Us
                    </Button>
                  )}
                  {service.id === "luxury-travel-coordination" && (
                    <Button href={ROUTES.contact} variant="outline" size="md" className="mt-10">
                      Plan Your Experience
                    </Button>
                  )}
                  {service.id === "content-creative-partnerships" && (
                    <Button
                      href={ROUTES.creativePartnerApplication}
                      variant="outline"
                      size="md"
                      className="mt-10"
                    >
                      Apply as Creative Partner
                    </Button>
                  )}
                </div>
                {image && (
                  <LuxuryImage
                    image={image}
                    aspectRatio="video"
                    className={`border border-black/10 ${index % 2 === 1 ? "lg:order-1" : ""}`}
                  />
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-black/10 bg-black py-section text-white sm:py-section-md lg:py-section-xl">
        <div className="luxury-container text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight sm:text-4xl">
            Not sure which service fits?
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-base leading-[1.85] text-white/65">
            Reach out and our team will recommend the right partnership path for
            your goals.
          </p>
          <Button href={ROUTES.contact} variant="secondary" size="lg" className="mt-12">
            Contact
          </Button>
        </div>
      </section>
    </>
  );
}

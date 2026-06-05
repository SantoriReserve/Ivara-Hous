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

      <section className="py-section sm:py-section-lg">
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
                    <Button
                      href={ROUTES.creatorDevelopment}
                      variant="primary"
                      size="md"
                      className="mt-10"
                    >
                      Take the Assessment
                    </Button>
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

      <section className="border-t border-black/10 bg-black py-section text-white sm:py-section-lg">
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

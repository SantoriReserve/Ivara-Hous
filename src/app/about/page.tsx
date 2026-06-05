import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Ivara Hous — a luxury travel agency connecting creators, properties, and creative partners.",
};

const values = [
  {
    title: "Curated Excellence",
    description:
      "Every partnership is intentionally selected to uphold the highest standards of luxury travel and creator storytelling.",
  },
  {
    title: "Integrated Partnership",
    description:
      "We connect creators, properties, travelers, and creative professionals into one cohesive, growth-oriented luxury travel system.",
  },
  {
    title: "Editorial Quality",
    description:
      "Content and experiences are crafted with an editorial eye — refined, aspirational, and unmistakably premium.",
  },
  {
    title: "Long-Term Growth",
    description:
      "Beyond campaigns, we build lasting relationships that drive hospitality growth and creator development.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="About"
        title="Redefining Luxury Travel Through Creator Partnerships"
        description="Ivara Hous bridges luxury hospitality and creator excellence — building a platform where every collaboration elevates the standard of travel storytelling."
      />

      <section className="py-section sm:py-section-lg">
        <div className="luxury-container">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <LuxuryImage
              image={SITE_IMAGES.about}
              aspectRatio="portrait"
              className="border border-black/10"
            />
            <div className="lg:pt-4">
              <SectionHeading
                label="Our Story"
                title="Built for the Modern Luxury Travel Landscape"
              />
              <p className="luxury-body-lg mt-10">
                Founded on the belief that luxury travel deserves equally
                luxurious storytelling, Ivara Hous emerged as a response to a
                fragmented creator-hospitality landscape. Properties struggled to
                find the right creators. Creators struggled to access premium
                partnerships. Creative professionals lacked a curated roster.
              </p>
              <p className="luxury-body mt-8">
                Today, Ivara Hous unifies these worlds — offering creator
                campaigns, partnership management, travel coordination,
                hospitality growth, creative partnerships, and AI-powered
                creator development under one exclusive luxury travel agency.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-gray-light py-section sm:py-section-lg">
        <div className="luxury-container">
          <SectionHeading
            label="Values"
            title="What Guides Us"
            align="center"
            className="mx-auto"
          />
          <div className="mt-20 grid gap-16 sm:grid-cols-2">
            {values.map((value) => (
              <article key={value.title}>
                <h3 className="font-serif text-2xl font-normal tracking-tight text-black">
                  {value.title}
                </h3>
                <p className="luxury-body mt-5">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-section sm:py-section-lg">
        <div className="luxury-container text-center">
          <SectionHeading
            title="Join the Platform"
            description="Whether you create, host, or produce — there is a place for you at Ivara Hous."
            align="center"
            className="mx-auto"
          />
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Button href={ROUTES.creatorApplication} variant="primary" size="lg">
              Apply As A Creator
            </Button>
            <Button href={ROUTES.partnerWithUs} variant="outline" size="lg">
              Partner With Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

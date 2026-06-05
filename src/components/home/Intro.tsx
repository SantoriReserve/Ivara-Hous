import { SectionHeading } from "@/components/ui/SectionHeading";

export function Intro() {
  return (
    <section className="py-section sm:py-section-lg">
      <div className="luxury-container">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5">
            <SectionHeading
              label="About Ivara Hous"
              title="A Luxury Travel Agency for the Modern Era"
              size="large"
            />
          </div>
          <div className="lg:col-span-7 lg:pt-4">
            <p className="font-sans text-lg leading-[1.85] text-black sm:text-xl sm:leading-[1.8]">
              Ivara Hous is more than a travel agency — it is a curated luxury
              travel system where hospitality, creator storytelling, and strategic
              partnerships converge.
            </p>
            <p className="luxury-body mt-8">
              We connect creators, luxury properties, travelers, and creative
              professionals through premium content, hospitality growth, creator
              development, and luxury travel coordination.
            </p>
            <p className="luxury-body mt-6">
              From villa campaigns in the Mediterranean to creator retreats in
              Bali, every partnership is designed with intention, exclusivity,
              and editorial excellence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

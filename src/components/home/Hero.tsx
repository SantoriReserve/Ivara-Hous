import { Button } from "@/components/ui/Button";
import { LuxuryImage } from "@/components/ui/LuxuryImage";
import { ROUTES, SITE_NAME } from "@/lib/constants";
import { SITE_IMAGES } from "@/lib/images";

export function Hero() {
  return (
    <section className="bg-black text-white">
      <div className="luxury-container py-8 sm:py-10 lg:py-12">
        <div className="grid overflow-hidden border border-white/10 lg:grid-cols-2 lg:items-stretch">
          {/* Yacht image — visible on all breakpoints */}
          <div className="relative order-1 min-h-[13rem] sm:min-h-[16rem] lg:order-2 lg:min-h-[26rem] lg:max-h-[28rem]">
            <LuxuryImage
              image={SITE_IMAGES.hero}
              aspectRatio="fill"
              priority
              dimmed
              quality={90}
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 lg:bg-gradient-to-l lg:from-black/50 lg:via-black/15 lg:to-transparent"
              aria-hidden
            />
          </div>

          {/* Copy — centered, balanced */}
          <div className="order-2 flex flex-col items-center justify-center px-8 py-12 text-center lg:order-1 lg:px-14 lg:py-14">
            <h1 className="font-serif text-[2.5rem] font-normal leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-[3.125rem]">
              {SITE_NAME}
            </h1>
            <p className="mt-4 font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-white/55">
              Luxury Travel Agency
            </p>
            <p className="mt-7 max-w-md font-sans text-[15px] font-light leading-[1.9] tracking-[0.01em] text-white/78 sm:text-base">
              Connecting creators, luxury properties, and elevated travel experiences
              through curated partnerships and strategic opportunities.
            </p>
            <div className="mt-10 flex w-full max-w-sm flex-col items-center justify-center gap-4 sm:max-w-none sm:flex-row sm:gap-5">
              <Button
                href={ROUTES.creatorDevelopment}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Assessment
              </Button>
              <Button
                href={ROUTES.creatorApplication}
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white hover:text-black sm:w-auto"
              >
                Apply As A Creator
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

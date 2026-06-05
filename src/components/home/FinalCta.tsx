import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export function FinalCta() {
  return (
    <section className="border-t border-black/10 bg-black py-section text-white sm:py-section-lg">
      <div className="luxury-container text-center">
        <p className="luxury-label mb-6 text-white/50">Get Started</p>
        <h2 className="luxury-heading mx-auto max-w-3xl text-3xl text-white sm:text-4xl lg:text-5xl">
          Elevate Your Place in Luxury Travel
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-base leading-[1.85] text-white/65 sm:text-lg">
          Whether you are a creator, property, or creative professional — Ivara
          Hous is your gateway to the luxury travel platform.
        </p>
        <div className="mt-14 flex flex-col items-center justify-center gap-5 sm:flex-row">
          <Button href={ROUTES.contact} variant="secondary" size="lg">
            Contact
          </Button>
          <Button
            href={ROUTES.services}
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-black"
          >
            Explore Services
          </Button>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ROUTES } from "@/lib/constants";
import { SERVICES } from "@/lib/services";

export function ServicesOverview() {
  return (
    <section className="py-section sm:py-section-md lg:py-section-xl">
      <div className="luxury-container">
        <div className="flex flex-col items-start justify-between gap-12 border-b border-black/10 pb-16 lg:flex-row lg:items-end">
          <SectionHeading
            label="Services"
            title="Curated Partnerships & Premium Experiences"
            description="Six core offerings for luxury properties, creators, and creative professionals."
          />
          <Button href={ROUTES.services} variant="outline" size="md" className="shrink-0">
            View All Services
          </Button>
        </div>

        <div className="mt-0 grid gap-px border-t border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => (
            <article
              key={service.id}
              className="group bg-white p-10 transition-colors duration-luxury ease-luxury hover:bg-gray-light sm:p-12"
            >
              <span className="luxury-label">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 font-serif text-2xl font-normal tracking-tight text-black">
                {service.title}
              </h3>
              <p className="mt-5 font-sans text-sm leading-[1.75] text-gray-mid">
                {service.shortDescription}
              </p>
              <Link
                href={`${ROUTES.services}#${service.id}`}
                className="mt-8 inline-block font-sans text-[10px] uppercase tracking-nav text-black opacity-0 transition-all duration-luxury group-hover:opacity-100"
              >
                Learn more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

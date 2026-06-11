import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHero } from "@/components/layout/PageHero";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Ivara Hous team.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        title="Let's Connect"
        description="For partnerships, creator inquiries, travel coordination, or general questions — we would love to hear from you."
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container max-w-2xl">
          <ContactForm />
        </div>
      </section>
    </>
  );
}

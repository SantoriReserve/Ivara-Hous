"use client";

import { FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { useFormSubmit } from "@/components/forms/useFormSubmit";
import { Button } from "@/components/ui/Button";
import { FormSuccess } from "@/components/ui/FormSuccess";

export function ContactForm() {
  const { state, error, submit, reset, isLoading } = useFormSubmit("/api/contact");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await submit(Object.fromEntries(form.entries()));
  }

  if (state === "success") {
    return (
      <FormSuccess
        title="Message Sent"
        message="Thank you for reaching out. A member of the Ivara Hous team will respond within 2–3 business days."
        onReset={reset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <FormField label="Name" name="name" required />
        <FormField label="Email" name="email" type="email" required />
      </div>
      <FormField
        label="Inquiry Type"
        name="inquiryType"
        as="select"
        required
        options={[
          { value: "general", label: "General Inquiry" },
          { value: "creator", label: "Creator" },
          { value: "partner", label: "Partnership" },
          { value: "travel", label: "Travel Coordination" },
          { value: "press", label: "Press / Media" },
        ]}
      />
      <FormField label="Subject" name="subject" required />
      <FormField as="textarea" label="Message" name="message" required rows={6} />

      {error && <p className="font-sans text-sm text-red-700" role="alert">{error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? "Sending…" : "Send Message"}
      </Button>
    </form>
  );
}

"use client";

import { FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { useFormSubmit } from "@/components/forms/useFormSubmit";
import { Button } from "@/components/ui/Button";
import { FormSuccess } from "@/components/ui/FormSuccess";

export function PartnerForm() {
  const { state, error, submit, reset, isLoading } = useFormSubmit(
    "/api/partner-with-us"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await submit(Object.fromEntries(form.entries()));
  }

  if (state === "success") {
    return (
      <FormSuccess
        title="Partnership Inquiry Received"
        message="Thank you for your interest in partnering with Ivara Hous. Our partnerships team will be in touch shortly."
        onReset={reset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <FormField label="Contact Name" name="contactName" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Property / Brand Name" name="propertyName" required />
        <FormField label="Location" name="location" required />
        <FormField label="Website" name="website" type="url" />
        <FormField
          label="Property Type"
          name="propertyType"
          as="select"
          required
          options={[
            { value: "hotel", label: "Luxury Hotel" },
            { value: "villa", label: "Villa" },
            { value: "resort", label: "Resort" },
            { value: "travel-brand", label: "Travel Brand" },
            { value: "other", label: "Other" },
          ]}
        />
      </div>

      <FormField
        label="Services of Interest"
        name="services"
        as="select"
        required
        options={[
          { value: "creator-development", label: "Creator Development System" },
          { value: "travel-creator-roster", label: "Travel Creator Roster" },
          { value: "creator-partnership-management", label: "Creator Partnership Management" },
          { value: "hospitality-growth-partner", label: "Hospitality Growth Partner" },
          { value: "luxury-travel-coordination", label: "Luxury Travel Coordination" },
          { value: "content-creative-partnerships", label: "Content & Creative Partnerships" },
          { value: "multiple", label: "Multiple Services" },
        ]}
      />
      <FormField
        as="textarea"
        label="Tell us about your property and partnership goals"
        name="goals"
        required
        rows={6}
      />
      <FormField
        as="textarea"
        label="Previous creator collaborations (if any)"
        name="previousCollaborations"
        rows={4}
      />

      {error && <p className="font-sans text-sm text-red-700" role="alert">{error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Submit Partnership Inquiry"}
      </Button>
    </form>
  );
}

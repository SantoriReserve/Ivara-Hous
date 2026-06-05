"use client";

import { FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { useFormSubmit } from "@/components/forms/useFormSubmit";
import { Button } from "@/components/ui/Button";
import { FormSuccess } from "@/components/ui/FormSuccess";

export function CreativePartnerForm() {
  const { state, error, submit, reset, isLoading } = useFormSubmit(
    "/api/creative-partner-application"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await submit(Object.fromEntries(form.entries()));
  }

  if (state === "success") {
    return (
      <FormSuccess
        title="Creative Partner Application Received"
        message="Thank you for applying to the Ivara Hous creative partner roster. We will review your portfolio and respond soon."
        onReset={reset}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <FormField label="Full Name" name="fullName" required />
        <FormField label="Email" name="email" type="email" required />
        <FormField label="Location" name="location" required />
        <FormField
          label="Creative Discipline"
          name="discipline"
          as="select"
          required
          options={[
            { value: "photography", label: "Photography" },
            { value: "videography", label: "Videography" },
            { value: "production", label: "Production" },
            { value: "editing", label: "Editing / Post-Production" },
            { value: "creative-direction", label: "Creative Direction" },
            { value: "other", label: "Other" },
          ]}
        />
      </div>

      <FormField label="Portfolio / Website" name="portfolio" type="url" required />
      <FormField label="Instagram / Social" name="social" placeholder="@username or URL" />
      <FormField
        as="textarea"
        label="Experience with luxury travel & hospitality"
        name="experience"
        required
        rows={5}
      />
      <FormField
        as="textarea"
        label="Notable clients or projects"
        name="notableWork"
        rows={4}
      />
      <FormField
        as="textarea"
        label="Availability & rate range (optional)"
        name="availability"
        rows={3}
      />

      {error && <p className="font-sans text-sm text-red-700" role="alert">{error}</p>}

      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}

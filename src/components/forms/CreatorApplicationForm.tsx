"use client";

import { FormEvent } from "react";
import { FormField } from "@/components/forms/FormField";
import { useFormSubmit } from "@/components/forms/useFormSubmit";
import { Button } from "@/components/ui/Button";
import { FormSuccess } from "@/components/ui/FormSuccess";

export function CreatorApplicationForm() {
  const { state, error, submit, reset, isLoading } = useFormSubmit(
    "/api/creator-application"
  );

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());
    await submit(data);
  }

  if (state === "success") {
    return (
      <FormSuccess
        title="Application Received"
        message="Thank you for applying to the Ivara Hous creator network. Our team will review your application and respond within 5–7 business days."
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
        <FormField label="Instagram Handle" name="instagram" placeholder="@username" />
        <FormField label="TikTok Handle" name="tiktok" placeholder="@username" />
        <FormField
          label="Follower Count"
          name="followerCount"
          as="select"
          required
          options={[
            { value: "under-10k", label: "Under 10K" },
            { value: "10k-50k", label: "10K – 50K" },
            { value: "50k-100k", label: "50K – 100K" },
            { value: "100k-500k", label: "100K – 500K" },
            { value: "500k-plus", label: "500K+" },
          ]}
        />
      </div>

      <FormField label="Primary Niche" name="niche" required placeholder="e.g. Luxury travel, lifestyle" />
      <FormField label="Portfolio / Website Link" name="portfolio" type="url" />
      <FormField
        as="textarea"
        label="Why do you want to join Ivara Hous?"
        name="motivation"
        required
        rows={5}
      />
      <FormField
        as="textarea"
        label="Recent brand partnerships or travel work"
        name="experience"
        rows={4}
      />
      <FormField
        as="textarea"
        label="Content samples or media kit link"
        name="contentSamples"
        rows={3}
      />

      {error && (
        <p className="font-sans text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Submit Application"}
      </Button>
    </form>
  );
}

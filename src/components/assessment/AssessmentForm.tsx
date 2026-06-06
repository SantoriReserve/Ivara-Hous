"use client";

import { FormEvent, useState } from "react";
import { FormField } from "@/components/forms/FormField";
import { useFormSubmit } from "@/components/forms/useFormSubmit";
import { AssessmentGeneratingState } from "@/components/assessment/AssessmentGeneratingState";
import { AssessmentResults } from "@/components/assessment/AssessmentResults";
import { Button } from "@/components/ui/Button";
import {
  ASSESSMENT_STEPS,
  type AssessmentAnswers,
  type AssessmentResult,
} from "@/lib/assessment";
import { saveCreatorDevAssessmentSession } from "@/lib/creator-dev-assessment-session";

const INITIAL: Partial<AssessmentAnswers> = {};

const FIELD_CONFIG: Record<
  keyof AssessmentAnswers,
  {
    label: string;
    type?: string;
    as?: "textarea" | "select";
    options?: { value: string; label: string }[];
    required?: boolean;
    rows?: number;
    placeholder?: string;
  }
> = {
  fullName: { label: "Full Name", required: true },
  email: { label: "Email", type: "email", required: true },
  location: { label: "Location", required: true, placeholder: "City, Country" },
  instagram: { label: "Instagram Link", placeholder: "https://instagram.com/..." },
  tiktok: { label: "TikTok Link", placeholder: "https://tiktok.com/@..." },
  niche: { label: "Your Niche", required: true, placeholder: "e.g. Luxury travel, lifestyle" },
  followerCount: {
    label: "Follower Count",
    as: "select",
    required: true,
    options: [
      { value: "under-5k", label: "Under 5K" },
      { value: "5k-25k", label: "5K – 25K" },
      { value: "25k-100k", label: "25K – 100K" },
      { value: "100k-plus", label: "100K+" },
    ],
  },
  portfolioLink: { label: "Current Portfolio Link", type: "url" },
  travelExperience: {
    label: "Travel Experience",
    as: "textarea",
    required: true,
    rows: 4,
    placeholder: "Describe your travel content experience…",
  },
  contentStyle: {
    label: "Content Style",
    as: "textarea",
    required: true,
    rows: 3,
    placeholder: "Editorial, cinematic, lifestyle, etc.",
  },
  goals: {
    label: "Your Goals",
    as: "textarea",
    required: true,
    rows: 4,
  },
  dreamPartnerships: {
    label: "Dream Partnerships",
    as: "textarea",
    required: true,
    rows: 3,
    placeholder: "Hotels, brands, destinations you aspire to work with…",
  },
  biggestChallenge: {
    label: "Biggest Challenge",
    as: "textarea",
    required: true,
    rows: 3,
  },
  upcomingTravel: {
    label: "Upcoming Travel Plans",
    as: "textarea",
    rows: 3,
  },
  budgetResources: {
    label: "Budget & Resources",
    as: "textarea",
    rows: 3,
    placeholder: "Monthly content budget, time commitment, etc.",
  },
  equipment: {
    label: "Current Equipment",
    as: "textarea",
    rows: 3,
    placeholder: "Camera, drone, editing setup…",
  },
  desiredOutcome: {
    label: "Desired Outcome",
    as: "textarea",
    required: true,
    rows: 4,
    placeholder: "What do you want to achieve with Ivara Hous?",
  },
};

export function AssessmentForm() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<AssessmentAnswers>>(INITIAL);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const { submit, error, isLoading } = useFormSubmit(
    "/api/creator-development-assessment"
  );

  const currentStep = ASSESSMENT_STEPS[step];
  const isLastStep = step === ASSESSMENT_STEPS.length - 1;
  const progress = ((step + 1) / ASSESSMENT_STEPS.length) * 100;

  async function handleStepSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const stepData = Object.fromEntries(form.entries()) as Partial<AssessmentAnswers>;
    const merged = { ...answers, ...stepData };
    setAnswers(merged);

    if (!isLastStep) {
      setStep((s) => s + 1);
      return;
    }

    const response = await submit(merged);
    if (response?.result) {
      const assessmentResult = response.result as AssessmentResult;
      saveCreatorDevAssessmentSession({
        assessmentId: assessmentResult.assessmentId,
        customerEmail: merged.email ?? "",
        fullName: merged.fullName ?? "",
      });
      setResult(assessmentResult);
    }
  }

  function goBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  if (isLoading && isLastStep) {
    return <AssessmentGeneratingState creatorName={answers.fullName} />;
  }

  if (result) {
    return (
      <AssessmentResults
        assessmentId={result.assessmentId}
        scores={result.analysis.scores}
        scoreExplanations={result.analysis.scoreExplanations}
        preview={result.analysis.preview}
        answers={answers}
      />
    );
  }

  return (
    <div>
      <div className="mb-12 border-b border-black/10 pb-10">
        <div className="flex items-center justify-between">
          <p className="luxury-label">
            Step {step + 1} of {ASSESSMENT_STEPS.length}
          </p>
          <p className="font-sans text-[11px] tracking-nav text-gray-muted">
            {Math.round(progress)}%
          </p>
        </div>
        <div className="mt-4 h-px w-full bg-black/10">
          <div
            className="h-px bg-black transition-all duration-luxury ease-luxury"
            style={{ width: `${progress}%` }}
          />
        </div>
        <h2 className="mt-8 font-serif text-2xl font-normal tracking-tight text-black sm:text-3xl">
          {currentStep.title}
        </h2>
      </div>

      <form onSubmit={handleStepSubmit} className="space-y-10">
        {currentStep.fields.map((fieldName) => {
          const config = FIELD_CONFIG[fieldName];
          const defaultValue = answers[fieldName] ?? "";

          if (config.as === "textarea") {
            return (
              <FormField
                key={fieldName}
                as="textarea"
                label={config.label}
                name={fieldName}
                required={config.required}
                rows={config.rows}
                placeholder={config.placeholder}
                defaultValue={defaultValue}
              />
            );
          }

          if (config.as === "select" && config.options) {
            return (
              <FormField
                key={fieldName}
                as="select"
                label={config.label}
                name={fieldName}
                required={config.required}
                options={config.options}
                defaultValue={defaultValue}
              />
            );
          }

          return (
            <FormField
              key={fieldName}
              label={config.label}
              name={fieldName}
              type={config.type}
              required={config.required}
              placeholder={config.placeholder}
              defaultValue={defaultValue}
            />
          );
        })}

        {error && (
          <p className="font-sans text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-5 border-t border-black/10 pt-10 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <Button type="button" variant="outline" size="md" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
            {isLoading
              ? "Processing…"
              : isLastStep
                ? "View My Results"
                : "Continue"}
          </Button>
        </div>
      </form>
    </div>
  );
}

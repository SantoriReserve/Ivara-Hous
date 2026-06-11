"use client";

import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import {
  SCORE_LABELS,
  type AssessmentAnswers,
  type AssessmentPreview,
  type AssessmentScores,
  type ScoreExplanations,
} from "@/lib/assessment";
import { getCollaborationTimeline } from "@/lib/assessment-schema";

type AssessmentResultsProps = {
  assessmentId: string;
  scores: AssessmentScores;
  scoreExplanations: ScoreExplanations;
  preview: AssessmentPreview;
  answers: Partial<AssessmentAnswers>;
};

const PLAN_BENEFITS = [
  "Personalized dashboard",
  "Daily action plan",
  "Portfolio development",
  "Partnership outreach templates",
  "Creator positioning strategy",
  "Resources and tools",
  "Instant access",
] as const;

function ScoreBar({
  label,
  value,
  explanation,
}: {
  label: string;
  value: number;
  explanation: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <p className="font-sans text-sm text-black">{label}</p>
        <p className="font-serif text-2xl font-normal tracking-tight text-black sm:text-3xl">
          {value}
        </p>
      </div>
      <div className="h-px w-full bg-black/10">
        <div
          className="h-px bg-black transition-all duration-luxury ease-luxury"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="font-sans text-sm leading-[1.75] text-gray-mid">{explanation}</p>
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="luxury-label mb-5">{title}</p>
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-4 font-sans text-sm text-black"
          >
            <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AssessmentResults({
  assessmentId,
  scores,
  scoreExplanations,
  preview,
  answers,
}: AssessmentResultsProps) {
  const entries = Object.entries(scores) as [keyof AssessmentScores, number][];
  const planHref = `${ROUTES.creatorDevelopmentPlan}?assessmentId=${encodeURIComponent(assessmentId)}`;

  return (
    <div className="max-w-full space-y-10 overflow-x-hidden sm:space-y-12">
      <div className="border border-black/10 bg-white p-6 sm:p-10 lg:p-14">
        <p className="luxury-label mb-5">Assessment Complete</p>
        <h2 className="luxury-heading text-2xl sm:text-4xl">
          Your Creator Development Preview
        </h2>
        {answers.fullName && (
          <p className="mt-6 font-sans text-sm text-gray-mid">
            Prepared for{" "}
            <span className="text-black">{answers.fullName}</span>
          </p>
        )}
        <p className="mt-8 max-w-xl text-sm leading-[1.75] text-gray-mid">
          {preview.recommendedNextStep}
        </p>
        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="luxury-label mb-3">Current Creator Stage</p>
            <p className="font-sans text-sm text-black">{preview.currentCreatorStage}</p>
          </div>
          <div>
            <p className="luxury-label mb-3">Creator Archetype</p>
            <p className="font-sans text-sm text-black">{preview.creatorArchetype}</p>
          </div>
          <div>
            <p className="luxury-label mb-3">Ideal Partnership Tier</p>
            <p className="font-sans text-sm text-black">{preview.idealPartnershipTier}</p>
          </div>
          <div>
            <p className="luxury-label mb-3">
              Estimated Timeline To First Collaboration Opportunity
            </p>
            <p className="font-sans text-sm text-black">
              {getCollaborationTimeline(preview, scores)}
            </p>
          </div>
        </div>
        <div className="mt-12 grid gap-12 border-t border-black/10 pt-12 sm:grid-cols-2">
          <InsightList title="Top 3 Strengths" items={preview.topStrengths} />
          <InsightList title="Top 3 Growth Opportunities" items={preview.growthOpportunities} />
        </div>
        <div className="mt-12 border-t border-black/10 pt-12">
          <p className="luxury-label mb-5">Priority Focus Areas</p>
          <ul className="space-y-4">
            {preview.priorityFocusAreas.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 font-sans text-sm text-black"
              >
                <span className="mt-2.5 h-px w-6 shrink-0 bg-black" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-10 border border-black/10 bg-gray-light p-6 sm:space-y-12 sm:p-10 lg:p-14">
        {entries.map(([key, value]) => (
          <ScoreBar
            key={key}
            label={SCORE_LABELS[key]}
            value={value}
            explanation={scoreExplanations[key]}
          />
        ))}
      </div>

      <div className="border border-black bg-black p-8 text-center text-white sm:p-12 lg:p-16">
        <p className="luxury-label mb-5 text-white/50">Recommended Next Step</p>
        <h3 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
          40-Day Creator Development Plan
        </h3>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.75] text-white/65">
          Your assessment preview is complete. Unlock the full personalized system —
          dashboard, daily actions, outreach templates, and instant access after
          purchase.
        </p>
        <p className="mt-8 font-serif text-4xl font-normal tracking-tight">$95</p>
        <ul className="mx-auto mt-10 max-w-md space-y-3 text-left">
          {PLAN_BENEFITS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 font-sans text-sm text-white/80"
            >
              <span className="mt-2.5 h-px w-5 shrink-0 bg-white/50" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
          <Button href={planHref} variant="secondary" size="lg" className="w-full sm:w-auto">
            View Development Plan
          </Button>
          <Button
            href={ROUTES.creatorDevelopmentPlan}
            variant="outline"
            size="lg"
            className="w-full border-white text-white hover:bg-white hover:text-black sm:w-auto"
          >
            Learn More — $95
          </Button>
        </div>
        <p className="mt-8 font-sans text-[10px] uppercase tracking-nav text-white/40">
          Purchase → Create account → Instant dashboard access → Plan by email → Begin Day 1
        </p>
      </div>
    </div>
  );
}

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

type AssessmentResultsProps = {
  scores: AssessmentScores;
  scoreExplanations: ScoreExplanations;
  preview: AssessmentPreview;
  answers: Partial<AssessmentAnswers>;
};

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
      <div className="flex items-end justify-between gap-6">
        <p className="font-sans text-sm text-black">{label}</p>
        <p className="font-serif text-3xl font-normal tracking-tight text-black">
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
  scores,
  scoreExplanations,
  preview,
  answers,
}: AssessmentResultsProps) {
  const entries = Object.entries(scores) as [keyof AssessmentScores, number][];

  return (
    <div className="space-y-12">
      <div className="border border-black/10 bg-white p-10 sm:p-14">
        <p className="luxury-label mb-5">Assessment Complete</p>
        <h2 className="luxury-heading text-3xl sm:text-4xl">
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
            <p className="luxury-label mb-3">Estimated Timeline To First Hosted Stay</p>
            <p className="font-sans text-sm text-black">
              {preview.estimatedTimelineToFirstHostedStay}
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

      <div className="space-y-12 border border-black/10 bg-gray-light p-10 sm:p-14">
        {entries.map(([key, value]) => (
          <ScoreBar
            key={key}
            label={SCORE_LABELS[key]}
            value={value}
            explanation={scoreExplanations[key]}
          />
        ))}
      </div>

      <div className="border border-black bg-black p-12 text-center text-white sm:p-16">
        <p className="luxury-label mb-5 text-white/50">Next Step</p>
        <h3 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
          Unlock Your 40-Day Creator Development Plan
        </h3>
        <p className="mx-auto mt-6 max-w-lg text-sm leading-[1.75] text-white/65">
          Personalized content strategy, portfolio guidance, outreach resources,
          and daily action steps tailored to your assessment results.
        </p>
        <p className="mt-8 font-serif text-4xl font-normal tracking-tight">$95</p>
        <Button href={ROUTES.contact} variant="secondary" size="lg" className="mt-10">
          Unlock Your 40-Day Creator Development Plan — $95
        </Button>
        <p className="mt-8 font-sans text-[10px] uppercase tracking-nav text-white/40">
          Secure checkout via Stripe — coming soon. Contact us to reserve your plan.
        </p>
      </div>
    </div>
  );
}

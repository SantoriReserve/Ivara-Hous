"use client";

import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import {
  SCORE_LABELS,
  type AssessmentAnswers,
  type AssessmentScores,
} from "@/lib/assessment";

type AssessmentResultsProps = {
  scores: AssessmentScores;
  answers: Partial<AssessmentAnswers>;
};

function ScoreBar({ label, value }: { label: string; value: number }) {
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
    </div>
  );
}

export function AssessmentResults({ scores, answers }: AssessmentResultsProps) {
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
          These scores are placeholder previews. Your full personalized analysis
          will be available with the full Creator Development Assessment and 40-day action plan.
        </p>
      </div>

      <div className="space-y-12 border border-black/10 bg-gray-light p-10 sm:p-14">
        {entries.map(([key, value]) => (
          <ScoreBar key={key} label={SCORE_LABELS[key]} value={value} />
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

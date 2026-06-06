"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Reviewing your creator profile…",
  "Analyzing your niche and positioning…",
  "Scoring portfolio and partnership readiness…",
  "Mapping your luxury travel alignment…",
  "Preparing your personalized preview…",
] as const;

type AssessmentGeneratingStateProps = {
  creatorName?: string;
};

export function AssessmentGeneratingState({ creatorName }: AssessmentGeneratingStateProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    const messageTimer = setInterval(() => {
      setMessageIndex((current) => (current + 1) % MESSAGES.length);
    }, 2800);

    const progressTimer = setInterval(() => {
      setProgress((current) => {
        if (current >= 92) return current;
        const increment = current < 40 ? 6 : current < 70 ? 3 : 1;
        return Math.min(92, current + increment);
      });
    }, 900);

    return () => {
      clearInterval(messageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const displayName = creatorName?.trim() || "Creator";

  return (
    <div
      className="mx-auto max-w-xl border border-black/10 bg-white px-8 py-14 text-center sm:px-12 sm:py-16"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="luxury-label text-gray-muted">Ivara Hous Assessment</p>
      <h2 className="mt-4 font-serif text-3xl font-normal tracking-tight text-black sm:text-4xl">
        Crafting your results, {displayName}
      </h2>
      <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-gray-mid">
        Our assessment engine is analyzing your answers to build a personalized luxury
        creator preview. This usually takes under 15 seconds.
      </p>

      <div className="mx-auto mt-10 h-px w-full max-w-sm overflow-hidden bg-black/10">
        <div
          className="h-px bg-black transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-6 font-sans text-xs uppercase tracking-nav text-gray-muted">
        {MESSAGES[messageIndex]}
      </p>

      <div className="mx-auto mt-8 flex h-10 w-10 items-center justify-center border border-black/15">
        <span className="block h-4 w-4 animate-pulse bg-black/80" aria-hidden />
      </div>
    </div>
  );
}

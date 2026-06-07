"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type PlanGeneratingStateProps = {
  initialStatus?: "generating" | "failed" | "none";
  errorMessage?: string;
};

type PlanStatusResponse = {
  plan: {
    id: string;
    status: string;
    completionPercentage: number;
    currentFocusDay: number;
  } | null;
};

const GENERATION_STEPS = [
  "Analyzing your assessment profile",
  "Building your 40-day blueprint",
  "Personalizing daily action tasks",
  "Preparing partnership resources",
  "Activating your dashboard",
] as const;

export function PlanGeneratingState({
  initialStatus = "none",
  errorMessage,
}: PlanGeneratingStateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(errorMessage ?? "");
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pollStatus = useCallback(async () => {
    const response = await fetch("/api/plan/generate");
    if (!response.ok) return;

    const data = (await response.json()) as PlanStatusResponse;
    if (data.plan?.status === "active" || data.plan?.status === "completed") {
      router.refresh();
    } else if (data.plan?.status === "failed") {
      setStatus("failed");
      setError("Plan generation failed. Please try again.");
    } else if (data.plan?.status === "generating") {
      setStatus("generating");
    }
  }, [router]);

  const triggerGeneration = useCallback(
    async (retry = false) => {
      setIsTriggering(true);
      setStatus("generating");
      setError("");
      setActiveStep(0);
      setElapsedSeconds(0);

      try {
        const response = await fetch("/api/plan/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ retry }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("failed");
          setError(data.error ?? "Failed to generate plan");
          return;
        }

        if (
          data.status === "generated" ||
          data.status === "existing" ||
          data.plan?.status === "active" ||
          data.plan?.status === "completed"
        ) {
          router.refresh();
          return;
        }

        if (data.status === "failed") {
          setStatus("failed");
          setError(
            data.error ??
              data.message ??
              "Plan generation failed. Please retry."
          );
          return;
        }

        if (data.status === "no_assessment") {
          setStatus("failed");
          setError(
            "No assessment found for your purchase. Complete the Creator Development Assessment first."
          );
          return;
        }

        setStatus("generating");
      } catch {
        setStatus("failed");
        setError("Network error while generating your plan.");
      } finally {
        setIsTriggering(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (
      initialStatus === "none" ||
      initialStatus === "generating" ||
      initialStatus === "failed"
    ) {
      void triggerGeneration(initialStatus === "failed");
    }
  }, [initialStatus, triggerGeneration]);

  useEffect(() => {
    if (status !== "generating") return;

    const interval = setInterval(() => {
      void pollStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [status, pollStatus]);

  useEffect(() => {
    if (status !== "generating") return;

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, GENERATION_STEPS.length - 1));
    }, 4000);

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timer);
    };
  }, [status]);

  if (status === "failed") {
    return (
      <div className="border border-black/10 bg-black/5 p-8 text-center">
        <p className="luxury-label mb-3 text-gray-muted">Plan Generation</p>
        <p className="font-sans text-sm text-gray-mid">{error}</p>
        <button
          type="button"
          onClick={() => void triggerGeneration(true)}
          disabled={isTriggering}
          className="mt-6 border border-black bg-black px-6 py-3 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isTriggering ? "Retrying…" : "Retry Generation"}
        </button>
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-black/5 p-8">
      <p className="luxury-label mb-3 text-center text-gray-muted">Building Your System</p>
      <h3 className="text-center font-serif text-2xl text-black">
        Personalizing your creator operating system
      </h3>
      <p className="mx-auto mt-4 max-w-md text-center font-sans text-sm leading-relaxed text-gray-mid">
        We&apos;re assembling your 40-day plan, pitch templates, and partnership resources.
        This usually takes under 90 seconds — your dashboard will refresh automatically.
      </p>

      <ul className="mx-auto mt-8 max-w-sm space-y-3">
        {GENERATION_STEPS.map((step, index) => {
          const isDone = index < activeStep;
          const isCurrent = index === activeStep;

          return (
            <li
              key={step}
              className={`flex items-center gap-3 font-sans text-sm transition-opacity ${
                isDone || isCurrent ? "text-black" : "text-gray-muted"
              }`}
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center text-[10px] ${
                  isDone
                    ? "bg-black text-white"
                    : isCurrent
                      ? "border border-black animate-pulse"
                      : "border border-black/20"
                }`}
              >
                {isDone ? "✓" : index + 1}
              </span>
              {step}
            </li>
          );
        })}
      </ul>

      <div className="mx-auto mt-8 h-1 w-48 overflow-hidden bg-black/10">
        <div
          className="h-full bg-black transition-all duration-1000"
          style={{ width: `${Math.min(95, ((activeStep + 1) / GENERATION_STEPS.length) * 100)}%` }}
        />
      </div>
      <p className="mt-4 text-center font-sans text-xs text-gray-muted">
        {elapsedSeconds}s elapsed
      </p>
    </div>
  );
}

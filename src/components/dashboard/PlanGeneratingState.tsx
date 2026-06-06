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

export function PlanGeneratingState({
  initialStatus = "none",
  errorMessage,
}: PlanGeneratingStateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState(errorMessage ?? "");
  const [isTriggering, setIsTriggering] = useState(false);

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
          setError(data.error ?? "Plan generation failed");
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
    if (initialStatus === "none" || initialStatus === "generating") {
      void triggerGeneration(false);
    }
  }, [initialStatus, triggerGeneration]);

  useEffect(() => {
    if (status !== "generating") return;

    const interval = setInterval(() => {
      void pollStatus();
    }, 4000);

    return () => clearInterval(interval);
  }, [status, pollStatus]);

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
    <div className="border border-black/10 bg-black/5 p-8 text-center">
      <p className="luxury-label mb-3 text-gray-muted">Building Your Plan</p>
      <h3 className="font-serif text-2xl text-black">Generating your 40-day plan</h3>
      <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-gray-mid">
        We&apos;re creating personalized daily tasks from your assessment results. This
        usually takes one to two minutes.
      </p>
      <div className="mx-auto mt-8 h-1 w-48 overflow-hidden bg-black/10">
        <div className="h-full w-1/2 animate-pulse bg-black" />
      </div>
    </div>
  );
}

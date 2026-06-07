"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveLearningInsight } from "@/app/actions/dashboard-engagement-actions";

type LearningInsightFormProps = {
  insightId: string;
  dayNumber: number;
  prompt: string;
  initialResponse?: string;
};

export function LearningInsightForm({
  insightId,
  dayNumber,
  prompt,
  initialResponse = "",
}: LearningInsightFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [response, setResponse] = useState(initialResponse);
  const [saved, setSaved] = useState(Boolean(initialResponse));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;

    startTransition(async () => {
      const result = await saveLearningInsight({
        insightId,
        dayNumber,
        prompt,
        response: response.trim(),
      });
      if (result.success) {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <label className="block">
        <span className="font-sans text-sm text-black">{prompt}</span>
        <textarea
          value={response}
          onChange={(e) => {
            setResponse(e.target.value);
            setSaved(false);
          }}
          rows={4}
          placeholder="A few sentences — what stood out and what you'll apply..."
          className="mt-2 w-full resize-y border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none focus:border-black"
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isPending || !response.trim()}
          className="bg-black px-6 py-2 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          {isPending ? "Saving..." : "Save insight"}
        </button>
        {saved && (
          <span className="font-sans text-xs text-gray-mid">Saved — used to personalize your plan</span>
        )}
      </div>
    </form>
  );
}

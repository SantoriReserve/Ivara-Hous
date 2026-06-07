"use client";

import { useState, useTransition } from "react";
import {
  markContentComplete,
  pinContentToToday,
  updateContentIdeaProgress,
} from "@/app/actions/dashboard-engagement-actions";
import { FallbackImage } from "@/components/dashboard/FallbackImage";
import type { ContentIdeaProgress } from "@/lib/dashboard/dashboard-engagement-repository";
import type { ContentIdea } from "@/lib/dashboard/content-ideas";
import { CONTENT_IMAGE_FALLBACK, getContentIdeaImage } from "@/lib/dashboard/opportunity-images";

type ContentIdeasViewProps = {
  ideas: ContentIdea[];
  initialProgress: ContentIdeaProgress[];
  currentFocusDay?: number;
};

const FORMAT_COLORS: Record<string, string> = {
  Reel: "bg-black text-white",
  TikTok: "bg-black text-white",
  Photo: "border border-black/20",
  Carousel: "border border-black/20",
  "Story Series": "border border-black/20",
  Campaign: "bg-black/5",
  Portfolio: "bg-black/5",
  UGC: "border border-black/20",
  "Talking-head": "border border-black/20",
  Review: "border border-black/20",
  Educational: "bg-black/5",
};

const TRACKING_STEPS: Array<{
  key: keyof Pick<ContentIdeaProgress, "planned" | "filmed" | "edited" | "posted">;
  label: string;
}> = [
  { key: "planned", label: "Planned" },
  { key: "filmed", label: "Filmed" },
  { key: "edited", label: "Edited" },
  { key: "posted", label: "Posted" },
];

function progressForIdea(
  ideaId: string,
  initialProgress: ContentIdeaProgress[]
): ContentIdeaProgress {
  const existing = initialProgress.find((p) => p.ideaId === ideaId);
  return (
    existing ?? {
      ideaId,
      planned: false,
      filmed: false,
      edited: false,
      posted: false,
    }
  );
}

function completionLabel(progress: ContentIdeaProgress): string {
  if (progress.posted) return "Posted";
  if (progress.edited) return "Edited";
  if (progress.filmed) return "Filmed";
  if (progress.planned) return "Planned";
  return "Not started";
}

export function ContentIdeasView({
  ideas,
  initialProgress,
  currentFocusDay = 1,
}: ContentIdeasViewProps) {
  const [isPending, startTransition] = useTransition();
  const [localProgress, setLocalProgress] = useState<Record<string, ContentIdeaProgress>>(() =>
    Object.fromEntries(
      ideas.map((idea) => [idea.id, progressForIdea(idea.id, initialProgress)])
    )
  );

  const handleToggle = (
    ideaId: string,
    key: keyof Pick<ContentIdeaProgress, "planned" | "filmed" | "edited" | "posted">,
    checked: boolean
  ) => {
    const current = localProgress[ideaId] ?? progressForIdea(ideaId, initialProgress);
    const updated = { ...current, [key]: checked };

    setLocalProgress((prev) => ({ ...prev, [ideaId]: updated }));

    startTransition(async () => {
      const result = await updateContentIdeaProgress(updated);
      if (!result.success) {
        setLocalProgress((prev) => ({ ...prev, [ideaId]: current }));
      }
    });
  };

  const handlePinToToday = (ideaId: string) => {
    startTransition(async () => {
      await pinContentToToday(currentFocusDay, ideaId);
    });
  };

  const handleMarkComplete = (ideaId: string) => {
    const completed: ContentIdeaProgress = {
      ideaId,
      planned: true,
      filmed: true,
      edited: true,
      posted: true,
    };
    setLocalProgress((prev) => ({ ...prev, [ideaId]: completed }));
    startTransition(async () => {
      const result = await markContentComplete(ideaId);
      if (!result.success) {
        setLocalProgress((prev) => ({
          ...prev,
          [ideaId]: progressForIdea(ideaId, initialProgress),
        }));
      }
    });
  };

  const postedCount = Object.values(localProgress).filter((p) => p.posted).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-black/10 p-4">
        <p className="font-sans text-sm text-gray-mid">
          {ideas.length}+ personalized assignments — pin any idea to Today, track production, and
          completion updates Wins & Progress automatically.
        </p>
        <p className="font-sans text-xs uppercase tracking-nav text-black">
          {postedCount} of {ideas.length} posted
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {ideas.map((idea) => {
          const progress = localProgress[idea.id] ?? progressForIdea(idea.id, initialProgress);
          const formatStyle = FORMAT_COLORS[idea.format] ?? "border border-black/20";

          return (
            <article
              key={idea.id}
              id={idea.id}
              className="flex flex-col overflow-hidden border border-black/10"
            >
              <FallbackImage
                src={getContentIdeaImage(idea.id, idea.format)}
                fallbackSrc={CONTENT_IMAGE_FALLBACK}
                alt={`${idea.format} inspiration — ${idea.title}`}
                aspectClassName="relative aspect-[3/2] w-full bg-black/5"
                sizes="(max-width: 768px) 100vw, 50vw"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 font-sans text-[10px] uppercase tracking-nav ${formatStyle}`}
                  >
                    {idea.format}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-nav text-white/90">
                    {completionLabel(progress)}
                  </span>
                </div>
              </FallbackImage>

              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-xs text-gray-muted">~{idea.estimatedTime}</span>
                </div>
                <h3 className="mt-2 font-serif text-xl font-normal tracking-tight text-black">
                  {idea.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-gray-mid">
                  {idea.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handlePinToToday(idea.id)}
                    disabled={isPending}
                    className="border border-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-black transition-opacity hover:opacity-60 disabled:opacity-40"
                  >
                    Add to Today&apos;s Plan
                  </button>
                  {!progress.posted && (
                    <button
                      type="button"
                      onClick={() => handleMarkComplete(idea.id)}
                      disabled={isPending}
                      className="bg-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-white transition-opacity hover:opacity-80 disabled:opacity-40"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                <div className="mt-4 border border-black/10 p-4">
                  <p className="luxury-label mb-3 text-gray-muted">Production tracking</p>
                  <div className="flex flex-wrap gap-4">
                    {TRACKING_STEPS.map((step) => (
                      <label
                        key={step.key}
                        className="flex cursor-pointer items-center gap-2 font-sans text-xs uppercase tracking-nav text-black"
                      >
                        <input
                          type="checkbox"
                          checked={progress[step.key]}
                          disabled={isPending}
                          onChange={(e) => handleToggle(idea.id, step.key, e.target.checked)}
                          className="h-3.5 w-3.5 accent-black"
                        />
                        {step.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="luxury-label mb-1 text-gray-muted">Deliverable</p>
                  <p className="font-sans text-sm font-medium text-black">{idea.deliverable}</p>
                </div>

                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="luxury-label mb-2 text-gray-muted">Shot list</p>
                  <ol className="space-y-2">
                    {idea.shotList.map((step, index) => (
                      <li key={step} className="flex gap-2 font-sans text-sm text-black">
                        <span className="shrink-0 text-gray-muted">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-4 grid gap-3 border-t border-black/10 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="luxury-label mb-1 text-gray-muted">Hook</p>
                    <p className="font-sans text-sm text-black">&ldquo;{idea.hook}&rdquo;</p>
                  </div>
                  <div>
                    <p className="luxury-label mb-1 text-gray-muted">CTA</p>
                    <p className="font-sans text-sm text-gray-mid">{idea.callToAction}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-black/10 pt-4">
                  <p className="luxury-label mb-1 text-gray-muted">Use in outreach</p>
                  <p className="font-sans text-sm text-gray-mid">{idea.outreachUse}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

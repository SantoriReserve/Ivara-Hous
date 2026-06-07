"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  markContentComplete,
  pinContentToToday,
  swapTodayContentRecommendation,
} from "@/app/actions/dashboard-engagement-actions";

type TodayContentFocusProps = {
  dayNumber: number;
  ideaId?: string;
  title: string;
  description: string;
  href: string;
  isPosted?: boolean;
};

export function TodayContentFocus({
  dayNumber,
  ideaId,
  title,
  description,
  href,
  isPosted = false,
}: TodayContentFocusProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handlePin = () => {
    if (!ideaId) return;
    startTransition(async () => {
      await pinContentToToday(dayNumber, ideaId);
      router.refresh();
    });
  };

  const handleSwap = () => {
    if (!ideaId) return;
    startTransition(async () => {
      const result = await swapTodayContentRecommendation(dayNumber, ideaId);
      if (result.success) router.refresh();
    });
  };

  const handleComplete = () => {
    if (!ideaId) return;
    startTransition(async () => {
      await markContentComplete(ideaId);
      router.refresh();
    });
  };

  return (
    <div className="border border-black/10 p-5">
      <p className="luxury-label mb-2 text-gray-muted">Content</p>
      <p className="font-serif text-lg text-black">{title}</p>
      <p className="mt-2 font-sans text-sm text-gray-mid">{description}</p>

      {ideaId && (
        <p className="mt-2 font-sans text-[10px] uppercase tracking-nav text-gray-muted">
          From Content Library · {isPosted ? "Posted" : "In progress"}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {ideaId && !isPosted && (
          <>
            <button
              type="button"
              onClick={handlePin}
              disabled={isPending}
              className="border border-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-black transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              Add to Today&apos;s Plan
            </button>
            <button
              type="button"
              onClick={handleSwap}
              disabled={isPending}
              className="border border-black/20 px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-black transition-opacity hover:opacity-60 disabled:opacity-40"
            >
              Swap Recommendation
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isPending}
              className="bg-black px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              Mark Complete
            </button>
          </>
        )}
        {ideaId && isPosted && (
          <span className="border border-black/10 px-3 py-1.5 font-sans text-[10px] uppercase tracking-nav text-black">
            Completed — counts toward Wins
          </span>
        )}
        <Link
          href={href}
          className="inline-block font-sans text-xs uppercase tracking-nav text-black underline"
        >
          Open in Library →
        </Link>
      </div>
    </div>
  );
}

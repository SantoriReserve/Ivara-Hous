import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type CongratulationsViewProps = {
  creatorName: string;
  completedTasks: number;
  totalTasks: number;
};

export function CongratulationsView({
  creatorName,
  completedTasks,
  totalTasks,
}: CongratulationsViewProps) {
  return (
    <div className="space-y-10 text-center">
      <div>
        <p className="luxury-label mb-3 text-gray-muted">Milestone Reached</p>
        <h2 className="font-serif text-4xl font-normal tracking-tight text-black">
          Congratulations, {creatorName}
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-gray-mid">
          You completed all {totalTasks} required tasks across your 40-day Creator
          Development Plan. You&apos;ve built the foundation for luxury travel
          partnerships — keep applying what you&apos;ve created.
        </p>
      </div>

      <div className="mx-auto max-w-sm border border-black/10 p-8">
        <p className="font-serif text-5xl text-black">100%</p>
        <p className="mt-2 font-sans text-sm text-gray-mid">
          {completedTasks} tasks completed
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href={ROUTES.dashboard}
          className="border border-black bg-black px-8 py-3 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80"
        >
          Return to Dashboard
        </Link>
        <Link
          href={ROUTES.creatorApplication}
          className="border border-black px-8 py-3 font-sans text-xs uppercase tracking-nav text-black transition-opacity hover:opacity-60"
        >
          Apply to Creator Roster
        </Link>
      </div>
    </div>
  );
}

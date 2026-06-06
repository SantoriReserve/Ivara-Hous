import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type PlanDayCardProps = {
  dayNumber: number;
  title: string;
  focusArea: string;
  completedTasks: number;
  totalTasks: number;
  isComplete: boolean;
};

export function PlanDayCard({
  dayNumber,
  title,
  focusArea,
  completedTasks,
  totalTasks,
  isComplete,
}: PlanDayCardProps) {
  const inProgress = completedTasks > 0 && !isComplete;

  return (
    <Link
      href={`${ROUTES.dashboardToday}?day=${dayNumber}`}
      className={`block border p-4 transition-colors hover:bg-black/5 ${
        isComplete
          ? "border-black/20 bg-black/5"
          : inProgress
            ? "border-black/15"
            : "border-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-sans text-xs uppercase tracking-nav text-gray-muted">
          Day {dayNumber}
        </span>
        <span className="font-sans text-[10px] uppercase tracking-nav text-gray-muted">
          {focusArea}
        </span>
      </div>
      <p className="mt-2 font-sans text-sm text-black">{title}</p>
      <p className="mt-2 font-sans text-xs text-gray-mid">
        {completedTasks}/{totalTasks} tasks
        {isComplete && " · Complete"}
      </p>
    </Link>
  );
}

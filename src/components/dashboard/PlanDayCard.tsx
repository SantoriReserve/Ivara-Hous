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
      className={`block border bg-white p-5 transition-all duration-luxury ease-luxury hover:border-black/25 hover:shadow-[0_8px_24px_rgba(0,0,0,0.05)] ${
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
      <p className="mt-2 font-serif text-base font-normal tracking-tight text-black">{title}</p>
      <p className="mt-2 font-sans text-xs text-gray-mid">
        {completedTasks}/{totalTasks} tasks
        {isComplete && " · Complete"}
      </p>
    </Link>
  );
}

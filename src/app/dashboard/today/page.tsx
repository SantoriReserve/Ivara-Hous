import Link from "next/link";
import { PlanGeneratingState } from "@/components/dashboard/PlanGeneratingState";
import { TaskChecklist } from "@/components/dashboard/TaskChecklist";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";
import { PLAN_DAY_COUNT } from "@/lib/plan/plan-constants";
import {
  getActivePlanForUser,
  getDayWithTasks,
  updateCurrentFocusDay,
} from "@/lib/plan/plan-repository";

type TodayPageProps = {
  searchParams: Promise<{ day?: string }>;
};

export default async function TodayPage({ searchParams }: TodayPageProps) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const plan = user ? await getActivePlanForUser(user.id) : null;

  if (!plan || plan.status === "generating") {
    return (
      <div className="space-y-8">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">Today</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Daily Tasks
          </h2>
        </section>
        <PlanGeneratingState
          initialStatus={plan?.status === "generating" ? "generating" : "none"}
        />
      </div>
    );
  }

  if (plan.status === "failed") {
    return (
      <div className="space-y-8">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">Today</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Daily Tasks
          </h2>
        </section>
        <PlanGeneratingState initialStatus="failed" />
      </div>
    );
  }

  const parsedDay = Number(params.day);
  const dayNumber =
    Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= PLAN_DAY_COUNT
      ? parsedDay
      : plan.currentFocusDay;

  if (user) {
    await updateCurrentFocusDay(plan.id, dayNumber);
  }

  const day = user
    ? await getDayWithTasks(plan.id, dayNumber, user.id)
    : null;

  if (!day) {
    return (
      <div className="space-y-8">
        <p className="font-sans text-sm text-gray-mid">Day not found.</p>
        <Link href={ROUTES.dashboardPlan} className="font-sans text-sm underline">
          View 40-Day Plan
        </Link>
      </div>
    );
  }

  const completedCount = day.tasks.filter((t) => t.completionStatus === "completed").length;
  const prevDay = dayNumber > 1 ? dayNumber - 1 : null;
  const nextDay = dayNumber < PLAN_DAY_COUNT ? dayNumber + 1 : null;

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Today</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
              Day {day.dayNumber}: {day.title}
            </h2>
            <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
              {day.objective}
            </p>
          </div>
          <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">
            ~{day.estimatedMinutes} min · {day.focusArea}
          </p>
        </div>
        <p className="mt-4 font-sans text-sm text-gray-mid">
          {completedCount} of {day.tasks.length} tasks complete — no calendar lock, work any
          day at your pace
        </p>
      </section>

      <TaskChecklist tasks={day.tasks} />

      <nav className="flex items-center justify-between border-t border-black/10 pt-6">
        {prevDay ? (
          <Link
            href={`${ROUTES.dashboardToday}?day=${prevDay}`}
            className="font-sans text-xs uppercase tracking-nav text-black hover:opacity-60"
          >
            ← Day {prevDay}
          </Link>
        ) : (
          <span />
        )}
        <Link
          href={ROUTES.dashboardPlan}
          className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
        >
          All 40 Days
        </Link>
        {nextDay ? (
          <Link
            href={`${ROUTES.dashboardToday}?day=${nextDay}`}
            className="font-sans text-xs uppercase tracking-nav text-black hover:opacity-60"
          >
            Day {nextDay} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

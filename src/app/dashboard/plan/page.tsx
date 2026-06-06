import { PlanDayCard } from "@/components/dashboard/PlanDayCard";
import { PlanGeneratingState } from "@/components/dashboard/PlanGeneratingState";
import { PlanProgressRing } from "@/components/dashboard/PlanProgressRing";
import { getCurrentUser } from "@/lib/auth/require-user";
import {
  getActivePlanForUser,
  getDayCompletionSummaries,
  getPlanGraph,
} from "@/lib/plan/plan-repository";

export default async function PlanPage() {
  const user = await getCurrentUser();
  const plan = user ? await getActivePlanForUser(user.id) : null;

  if (!plan || plan.status === "generating") {
    return (
      <div className="space-y-8">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">40-Day Plan</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Your Full Plan
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
          <p className="luxury-label mb-3 text-gray-muted">40-Day Plan</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Your Full Plan
          </h2>
        </section>
        <PlanGeneratingState initialStatus="failed" />
      </div>
    );
  }

  const [graph, daySummaries] = await Promise.all([
    getPlanGraph(plan.id),
    getDayCompletionSummaries(plan.id),
  ]);

  return (
    <div className="space-y-10">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="luxury-label mb-3 text-gray-muted">40-Day Plan</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            {plan.planSummary.title}
          </h2>
          <p className="mt-3 font-sans text-sm text-gray-mid">
            Jump to any day — progress is tracked, not calendar-locked
          </p>
        </div>
        <PlanProgressRing percentage={plan.completionPercentage} size={96} />
      </section>

      {graph?.weeks.map((week) => {
        const weekDays = daySummaries.filter(
          (d) => d.dayNumber >= week.startDay && d.dayNumber <= week.endDay
        );

        return (
          <section key={week.weekNumber} className="space-y-4">
            <div className="border-b border-black/10 pb-4">
              <p className="luxury-label text-gray-muted">Week {week.weekNumber}</p>
              <h3 className="mt-1 font-serif text-xl text-black">{week.title}</h3>
              <p className="mt-2 font-sans text-sm text-gray-mid">{week.milestone}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {weekDays.map((day) => (
                <PlanDayCard
                  key={day.dayNumber}
                  dayNumber={day.dayNumber}
                  title={day.title}
                  focusArea={day.focusArea}
                  completedTasks={day.completedTasks}
                  totalTasks={day.totalTasks}
                  isComplete={day.isComplete}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

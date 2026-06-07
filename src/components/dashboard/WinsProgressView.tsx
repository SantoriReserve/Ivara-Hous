import Link from "next/link";
import { PlanProgressRing } from "@/components/dashboard/PlanProgressRing";
import { ROUTES } from "@/lib/constants";
import type { PlanInstanceRecord } from "@/lib/plan/plan-schema";

type WinsProgressViewProps = {
  plan: PlanInstanceRecord;
  recentWins: string[];
  nextAction?: string;
};

export function WinsProgressView({ plan, recentWins, nextAction }: WinsProgressViewProps) {
  const milestones = [
    { label: "Days started", value: plan.currentFocusDay, total: 40 },
    { label: "Required tasks done", value: plan.completedRequiredTasks, total: plan.totalRequiredTasks },
    { label: "Plan completion", value: plan.completionPercentage, total: 100, suffix: "%" },
  ];

  return (
    <div className="space-y-10">
      <section className="grid gap-8 border border-black/10 p-8 md:grid-cols-[auto_1fr] md:items-center">
        <PlanProgressRing percentage={plan.completionPercentage} size={160} />
        <div className="space-y-6">
          <div>
            <p className="luxury-label mb-2 text-gray-muted">Your Progress</p>
            <h3 className="font-serif text-2xl text-black">
              {plan.completionPercentage >= 100
                ? "Plan complete — outstanding work"
                : `${plan.completionPercentage}% through your 40-day system`}
            </h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {milestones.map((m) => (
              <div key={m.label} className="border border-black/10 p-4">
                <p className="luxury-label mb-1 text-gray-muted">{m.label}</p>
                <p className="font-serif text-2xl text-black">
                  {m.value}
                  {m.suffix ?? ` / ${m.total}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <p className="luxury-label mb-4 text-gray-muted">Recent Wins</p>
        <ul className="space-y-3">
          {recentWins.map((win) => (
            <li
              key={win}
              className="flex items-start gap-3 border border-black/10 p-4 font-sans text-sm text-gray-mid"
            >
              <span className="mt-0.5 text-black">✓</span>
              <span>{win}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-black bg-black p-6 text-white">
        <p className="font-serif text-xl">Keep momentum</p>
        <p className="mt-2 font-sans text-sm text-white/75">
          {nextAction ?? "Return to Today for your next action, or browse Partnership Opportunities for outreach targets."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`${ROUTES.dashboardToday}?day=${plan.currentFocusDay}`}
            className="border border-white px-5 py-2 font-sans text-xs uppercase tracking-nav hover:opacity-80"
          >
            Continue Today
          </Link>
          <Link
            href={ROUTES.dashboardPartnerships}
            className="font-sans text-xs uppercase tracking-nav text-white/75 hover:text-white"
          >
            View Opportunities →
          </Link>
        </div>
      </section>
    </div>
  );
}

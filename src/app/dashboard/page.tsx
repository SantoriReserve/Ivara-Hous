import Link from "next/link";
import { PlanGeneratingState } from "@/components/dashboard/PlanGeneratingState";
import { PlanProgressRing } from "@/components/dashboard/PlanProgressRing";
import { getProfileByUserId } from "@/lib/auth/profile-repository";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";
import { getPlanGraph, getActivePlanForUser } from "@/lib/plan/plan-repository";
import { getActivePurchaseForUser } from "@/lib/purchase-repository";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileByUserId(user.id) : null;
  const purchase = user ? await getActivePurchaseForUser(user.id) : null;
  const plan = user ? await getActivePlanForUser(user.id) : null;

  if (!plan) {
    return (
      <div className="space-y-10">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">Overview</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Your Creator Development Dashboard
          </h2>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
            We&apos;ll build your personalized 40-day plan from your assessment results.
          </p>
        </section>
        <PlanGeneratingState initialStatus="none" />
      </div>
    );
  }

  if (plan.status === "generating") {
    return (
      <div className="space-y-10">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">Overview</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Your Creator Development Dashboard
          </h2>
        </section>
        <PlanGeneratingState initialStatus="generating" />
      </div>
    );
  }

  if (plan.status === "failed") {
    return (
      <div className="space-y-10">
        <section>
          <p className="luxury-label mb-3 text-gray-muted">Overview</p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
            Your Creator Development Dashboard
          </h2>
        </section>
        <PlanGeneratingState initialStatus="failed" />
      </div>
    );
  }

  const graph = await getPlanGraph(plan.id);
  const currentWeek = graph?.weeks.find(
    (w) => plan.currentFocusDay >= w.startDay && plan.currentFocusDay <= w.endDay
  );

  const showCongratsBanner =
    plan.completionPercentage >= 100 && !profile?.congratulationsSeenAt;

  return (
    <div className="space-y-10">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Overview</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          {plan.planSummary.title}
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          {plan.planSummary.subtitle}
        </p>
      </section>

      {showCongratsBanner && (
        <section className="border border-black bg-black p-6 text-white">
          <p className="font-serif text-xl">You completed your 40-day plan!</p>
          <p className="mt-2 font-sans text-sm text-white/75">
            Celebrate your milestone and see what&apos;s next.
          </p>
          <Link
            href={ROUTES.dashboardCongratulations}
            className="mt-4 inline-block border border-white px-6 py-2 font-sans text-xs uppercase tracking-nav transition-opacity hover:opacity-80"
          >
            View Congratulations
          </Link>
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
        <PlanProgressRing percentage={plan.completionPercentage} />
        <div className="space-y-4">
          <div>
            <p className="luxury-label mb-1 text-gray-muted">Progress</p>
            <p className="font-sans text-sm text-black">
              {plan.completedRequiredTasks} of {plan.totalRequiredTasks} required tasks
              completed
            </p>
            <p className="mt-1 font-sans text-sm text-gray-mid">
              Day {plan.currentFocusDay} of 40 — work at your own pace, no deadlines
            </p>
          </div>
          <Link
            href={`${ROUTES.dashboardToday}?day=${plan.currentFocusDay}`}
            className="inline-block border border-black bg-black px-6 py-3 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80"
          >
            Continue Today
          </Link>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="border border-black/10 p-6">
          <p className="luxury-label mb-2 text-gray-muted">Creator Profile</p>
          <p className="font-sans text-sm text-black">
            {plan.planSummary.creatorStage}
          </p>
          <p className="mt-1 font-sans text-sm text-gray-mid">
            {plan.planSummary.creatorArchetype}
          </p>
          <p className="mt-3 font-sans text-xs text-gray-muted">
            Target tier: {plan.planSummary.idealPartnershipTier}
          </p>
        </div>

        <div className="border border-black/10 p-6">
          <p className="luxury-label mb-2 text-gray-muted">This Week</p>
          {currentWeek ? (
            <>
              <p className="font-sans text-sm text-black">{currentWeek.title}</p>
              <p className="mt-2 font-sans text-sm text-gray-mid">
                {currentWeek.milestone}
              </p>
            </>
          ) : (
            <p className="font-sans text-sm text-gray-mid">Week milestone loading…</p>
          )}
        </div>
      </section>

      <section className="border border-black/10 p-6">
        <p className="luxury-label mb-2 text-gray-muted">Primary Goal</p>
        <p className="font-sans text-sm text-gray-mid">{plan.planSummary.primaryGoal}</p>
        {purchase && (
          <p className="mt-4 font-sans text-xs text-gray-muted">
            Purchase confirmed {new Date(purchase.purchasedAt).toLocaleDateString()}
          </p>
        )}
      </section>
    </div>
  );
}

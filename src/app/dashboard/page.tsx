import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PlanGeneratingState } from "@/components/dashboard/PlanGeneratingState";
import { PlanProgressRing } from "@/components/dashboard/PlanProgressRing";
import { getHubCardImageAsset } from "@/lib/dashboard/dashboard-images";
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
  const focusDay = graph?.days.find((d) => d.dayNumber === plan.currentFocusDay);
  const completedTaskIds = new Set(
    graph?.completions
      .filter((c) => c.status === "completed")
      .map((c) => c.planDayTaskId) ?? []
  );
  const nextTask = graph?.tasks
    .filter((task) => task.planDayId === focusDay?.id)
    .sort((a, b) => a.taskOrder - b.taskOrder)
    .find((task) => task.isRequired && !completedTaskIds.has(task.id));

  const showCongratsBanner =
    plan.completionPercentage >= 100 && !profile?.congratulationsSeenAt;

  const hubToday = getHubCardImageAsset("today");
  const hubPitch = getHubCardImageAsset("pitch");
  const hubPartnerships = getHubCardImageAsset("partnerships");
  const hubContent = getHubCardImageAsset("content");
  const hubResources = getHubCardImageAsset("resources");
  const hubWins = getHubCardImageAsset("wins");

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
        <div className="space-y-5">
          <div>
            <p className="luxury-label mb-1 text-gray-muted">Progress</p>
            <p className="font-serif text-3xl font-normal tracking-tight text-black">
              {plan.completionPercentage}%
            </p>
            <p className="mt-2 font-sans text-sm text-black">
              {plan.completedRequiredTasks} of {plan.totalRequiredTasks} required tasks
              completed
            </p>
            <p className="mt-1 font-sans text-sm text-gray-mid">
              Day {plan.currentFocusDay} of 40 — work at your own pace, no deadlines
            </p>
          </div>
          {nextTask && (
            <div className="border border-black/10 bg-gray-light p-5">
              <p className="luxury-label mb-2 text-gray-muted">Next Recommended Action</p>
              <p className="font-sans text-sm text-black">{nextTask.title}</p>
              <p className="mt-2 font-sans text-xs leading-relaxed text-gray-mid">
                {nextTask.instruction}
              </p>
            </div>
          )}
          {focusDay && (
            <p className="font-sans text-xs text-gray-muted">
              Today&apos;s focus: {focusDay.title}
            </p>
          )}
          <Link
            href={`${ROUTES.dashboardToday}?day=${plan.currentFocusDay}`}
            className="inline-block w-full border border-black bg-black px-6 py-3 text-center font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80 sm:w-auto"
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

      <section>
        <p className="luxury-label mb-4 text-gray-muted">Your Creator Operating System</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            label="Start here"
            title="Today's Tasks"
            description={`Day ${plan.currentFocusDay}: specific actions toward "${plan.planSummary.primaryGoal}" — not reflection, execution.`}
            href={`${ROUTES.dashboardToday}?day=${plan.currentFocusDay}`}
            meta="Open today's assignments →"
            imageSrc={hubToday.src}
            imagePosition={hubToday.objectPosition}
          />
          <DashboardCard
            label="Send today"
            title="Pitch Templates"
            description="6 warm, pre-filled pitches with a 'send today' action on each — hotels, restaurants, UGC, follow-ups."
            href={ROUTES.dashboardPitchTemplates}
            meta="Copy, personalize one line, send"
            imageSrc={hubPitch.src}
            imagePosition={hubPitch.objectPosition}
          />
          <DashboardCard
            label="Contact today"
            title="Partnership Opportunities"
            description="Curated targets with a specific outreach action on every card — who to DM or email and what pitch to use."
            href={ROUTES.dashboardPartnerships}
            meta="Includes local + dream brands"
            imageSrc={hubPartnerships.src}
            imagePosition={hubPartnerships.objectPosition}
          />
          <DashboardCard
            label="Post this week"
            title="Content Ideas"
            description="Step-by-step shoot lists and posting instructions — each tied to how you'll use it in a pitch."
            href={ROUTES.dashboardContentIdeas}
            meta="Shoot lists included"
            imageSrc={hubContent.src}
            imagePosition={hubContent.objectPosition}
          />
          <DashboardCard
            label="Build systems"
            title="Resources"
            description="Media kit, outreach tracker, rate card — personalized to your stage with a 'do today' on each."
            href={ROUTES.dashboardResources}
            meta="6 systems, 6 actions"
            imageSrc={hubResources.src}
            imagePosition={hubResources.objectPosition}
          />
          <DashboardCard
            label="Track momentum"
            title="Wins & Progress"
            description="See how close you are to your first partnership — and what to do next."
            href={ROUTES.dashboardWins}
            meta={`${plan.completionPercentage}% complete`}
            imageSrc={hubWins.src}
            imagePosition={hubWins.objectPosition}
          />
        </div>
      </section>
    </div>
  );
}

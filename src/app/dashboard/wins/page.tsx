import { WinsProgressView } from "@/components/dashboard/WinsProgressView";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { countPostedContent } from "@/lib/dashboard/dashboard-engagement-repository";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

function buildRecentWins(
  completedTasks: number,
  currentDay: number,
  ctx: CreatorContext,
  postedContent: number
): string[] {
  const wins: string[] = [];

  if (completedTasks >= 1) {
    wins.push(
      `You've completed ${completedTasks} partnership action${completedTasks === 1 ? "" : "s"} — brands respond to consistent execution`
    );
  }
  if (currentDay >= 3 && completedTasks >= 3) {
    wins.push(`Media kit and positioning work underway — you're building toward ${ctx.dreamPartnerships}`);
  }
  if (currentDay >= 7) {
    wins.push(`Week 1 done: your ${ctx.instagram || "profile"} should now signal ${ctx.tier} partnership readiness`);
  }
  if (postedContent >= 1) {
    wins.push(
      `${postedContent} content assignment${postedContent === 1 ? "" : "s"} posted — attach links to your next outreach wave`
    );
  }
  if (currentDay >= 14) {
    wins.push(`Content proof live — you have assets to attach to pitches for ${ctx.niche} brands`);
  }
  if (currentDay >= 17 && completedTasks >= 10) {
    wins.push(`Outreach launched — you're no longer waiting for brands to find you`);
  }
  if (currentDay >= 21) {
    wins.push(`15+ target messages should be out — follow-ups are where first partnerships happen`);
  }
  if (completedTasks >= 25) {
    wins.push(`Strong momentum toward "${ctx.primaryGoal}" — this is what $150 systems are built for`);
  }

  if (wins.length === 0) {
    wins.push(`Your plan is built around one outcome: ${ctx.primaryGoal}`);
    wins.push(`First win unlocks when you complete Day 1 on Today — one action, today`);
  }

  return wins.slice(0, 6);
}

function buildNextAction(ctx: CreatorContext, currentDay: number, completedTasks: number): string {
  if (completedTasks === 0) {
    return `Complete Day 1 on Today — your first action toward ${ctx.dreamPartnerships}.`;
  }
  if (currentDay < 7) {
    return `Finish portfolio setup (Days 1–7), then you'll start pitching ${ctx.dreamPartnerships} in Week 3.`;
  }
  if (currentDay < 15) {
    return `Publish one content idea from Content Ideas this week — attach it to your next hotel pitch.`;
  }
  if (currentDay < 22) {
    return `Send 3 outreach messages today using Partnership Opportunities + Pitch Templates.`;
  }
  return `Follow up with every non-responder from last week — partnerships often close on the second touch.`;
}

export default async function WinsPage() {
  const user = await getCurrentUser();
  const { plan, creatorContext } = user
    ? await getDashboardContext(user.id)
    : { plan: null, creatorContext: null };

  if (!plan || plan.status !== "active" || !creatorContext) {
    return (
      <div className="space-y-6">
        <p className="luxury-label text-gray-muted">Wins & Progress</p>
        <h2 className="font-serif text-3xl text-black">Track Your Momentum</h2>
        <p className="font-sans text-sm text-gray-mid">
          Your wins and progress visualization appear once your plan is active.
        </p>
      </div>
    );
  }

  const postedContent = user ? await countPostedContent(user.id) : 0;

  const recentWins = buildRecentWins(
    plan.completedRequiredTasks,
    plan.currentFocusDay,
    creatorContext,
    postedContent
  );

  const nextAction = buildNextAction(
    creatorContext,
    plan.currentFocusDay,
    plan.completedRequiredTasks
  );

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Wins & Progress</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Your Path to a First Partnership
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          Working toward: {creatorContext.primaryGoal}. {nextAction}
        </p>
      </section>
      <WinsProgressView plan={plan} recentWins={recentWins} nextAction={nextAction} />
    </div>
  );
}

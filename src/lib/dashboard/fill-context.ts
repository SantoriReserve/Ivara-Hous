import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export function fillContext(ctx: CreatorContext, text: string): string {
  const pillar2 = ctx.contentPillars[1] ?? ctx.niche;
  const pillar3 = ctx.contentPillars[2] ?? ctx.niche;
  const gap2 = ctx.portfolioGaps[1] ?? "partnership case studies";
  const priority = ctx.priorityFocusAreas[0] ?? "outreach";
  const secondaryGoal = ctx.secondaryGoals[0] ?? ctx.primaryGoal;

  return text
    .replace(/\{name\}/g, ctx.fullName)
    .replace(/\{niche\}/g, ctx.niche)
    .replace(/\{location\}/g, ctx.location)
    .replace(/\{instagram\}/g, ctx.instagram || "your Instagram")
    .replace(/\{followers\}/g, ctx.followerCount)
    .replace(/\{goal\}/g, ctx.primaryGoal)
    .replace(/\{secondaryGoal\}/g, secondaryGoal)
    .replace(/\{dream\}/g, ctx.dreamPartnerships)
    .replace(/\{challenge\}/g, ctx.biggestChallenge)
    .replace(/\{stage\}/g, ctx.stage)
    .replace(/\{archetype\}/g, ctx.archetype)
    .replace(/\{tier\}/g, ctx.tier)
    .replace(/\{travel\}/g, ctx.upcomingTravel || "your next trip")
    .replace(/\{pillar\}/g, ctx.contentPillars[0] ?? ctx.niche)
    .replace(/\{pillar2\}/g, pillar2)
    .replace(/\{pillar3\}/g, pillar3)
    .replace(/\{gap\}/g, ctx.portfolioGaps[0] ?? "partnership proof")
    .replace(/\{gap2\}/g, gap2)
    .replace(/\{priority\}/g, priority)
    .replace(/\{positioning\}/g, ctx.positioningStatement)
    .replace(/\{style\}/g, ctx.contentStyle)
    .replace(/\{equipment\}/g, ctx.equipment || "your camera and phone");
}

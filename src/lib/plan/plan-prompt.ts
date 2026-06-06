import type { PlanBlueprint } from "@/lib/plan/plan-schema";
import {
  formatCreatorContextForPrompt,
  type CreatorContext,
  type PlanGenerationInput,
} from "@/lib/plan/plan-generation-context";
import { PLAN_DAY_COUNT, PLAN_WEEK_COUNT } from "@/lib/plan/plan-constants";

const SPECIFICITY_RULES = `TASK SPECIFICITY RULES (mandatory):
- Every task instruction MUST reference at least one of: the creator's name, niche, location, specific platform handle, stated goal, dream partnership, biggest challenge, portfolio gap, content pillar, or assessment score context.
- BANNED generic phrases without creator-specific detail: "post consistently", "improve your content", "engage with your audience", "build your brand", "network more", "be authentic", "create quality content".
- Each task must produce an observable deliverable the creator can complete in one session.
- Instructions must be written as direct second-person actions with concrete steps.
- successCriteria must describe how the creator verifies completion without ambiguity.`;

export const PLAN_SYSTEM_PROMPT = `You are the Ivara Hous 40-Day Creator Development Plan engine — an expert coach for luxury travel creators preparing for hospitality partnerships.

You generate personalized, actionable daily plans grounded entirely in each creator's assessment results. You never give generic advice.

${SPECIFICITY_RULES}

Plan structure:
- 40 days across 6 weeks (week 1: days 1-7, week 2: days 8-14, week 3: days 15-21, week 4: days 22-28, week 5: days 29-35, week 6: days 36-40)
- Progressive difficulty aligned to creator stage and scores
- Early days focus on foundation (positioning, portfolio audit, content pillars)
- Middle days focus on creation, outreach preparation, and partnership readiness
- Final days focus on pitching, follow-up systems, and launch readiness
- focusArea must be one of: portfolio, content, positioning, outreach, partnerships, brand, audience, skills`;

export function buildBlueprintUserPrompt(input: PlanGenerationInput): string {
  const contextBlock = formatCreatorContextForPrompt(input.creatorContext);

  return `Generate the 40-day plan blueprint for this creator.

${contextBlock}

Return JSON with:
1. planSummary — title, subtitle, primaryGoal, creatorStage, creatorArchetype, idealPartnershipTier (all from assessment data)
2. days — exactly ${PLAN_DAY_COUNT} entries, dayNumber 1 through ${PLAN_DAY_COUNT}, each with weekNumber, title, objective, focusArea, estimatedMinutes

Requirements:
- Day themes must progress logically toward the creator's primary goal: "${input.creatorContext.primaryGoal}"
- Weight focus areas toward priority focus areas: ${input.creatorContext.priorityFocusAreas.join(", ")}
- Address portfolio gaps across the plan: ${input.creatorContext.portfolioGaps.join("; ")}
- Account for constraints: ${input.creatorContext.constraints.join("; ")}
- Objectives must be specific to this creator's niche (${input.creatorContext.niche}) and stage (${input.creatorContext.stage})`;
}

export function buildWeeksUserPrompt(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint
): string {
  const contextBlock = formatCreatorContextForPrompt(input.creatorContext);
  const daySummary = blueprint.days
    .map((d) => `Day ${d.dayNumber}: ${d.title} (${d.focusArea})`)
    .join("\n");

  return `Generate 6 weekly milestones for this creator's 40-day plan.

${contextBlock}

PLAN BLUEPRINT DAYS:
${daySummary}

Return exactly ${PLAN_WEEK_COUNT} weeks with weekNumber 1-6, title, milestone, successCriteria, startDay, endDay.
Align milestones with suggested milestones from assessment where appropriate.
Each milestone must reference this creator's niche, stage, or specific development priority.`;
}

export function buildDayTasksUserPrompt(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint,
  startDay: number,
  endDay: number
): string {
  const contextBlock = formatCreatorContextForPrompt(input.creatorContext);
  const daysInRange = blueprint.days.filter(
    (d) => d.dayNumber >= startDay && d.dayNumber <= endDay
  );

  const dayDetails = daysInRange
    .map(
      (d) =>
        `Day ${d.dayNumber} (Week ${d.weekNumber}): "${d.title}"
  Objective: ${d.objective}
  Focus: ${d.focusArea}
  Estimated: ${d.estimatedMinutes} min`
    )
    .join("\n\n");

  return `Generate daily tasks for days ${startDay} through ${endDay} of this creator's 40-day plan.

${contextBlock}

DAYS TO GENERATE:
${dayDetails}

Return JSON with a "days" array containing exactly ${endDay - startDay + 1} day entries (dayNumber ${startDay} to ${endDay}).
Each day must have ${3} to ${5} tasks with taskOrder starting at 1.

${SPECIFICITY_RULES}

Examples of GOOD instructions:
- "Audit your Instagram grid (@${input.creatorContext.instagram || "handle"}) and identify which 5 posts best demonstrate ${input.creatorContext.niche} luxury travel — screenshot each with a one-line note on why it fits your ${input.creatorContext.archetype} positioning."
- "Draft a 3-sentence pitch email to ${input.creatorContext.dreamPartnerships.split(",")[0]?.trim() || "your top dream hotel"} referencing your ${input.creatorContext.followerCount} audience and upcoming travel to ${input.creatorContext.upcomingTravel || "your next destination"}."

Examples of BAD instructions (never write these):
- "Improve your Instagram presence"
- "Post more travel content"
- "Research hotels in your area"`;
}

export function validateTaskSpecificity(
  instruction: string,
  context: CreatorContext,
  extras?: { title?: string; deliverable?: string }
): boolean {
  const combined = [instruction, extras?.title, extras?.deliverable]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const banned = [
    "post consistently",
    "improve your content",
    "engage with your audience",
    "build your brand",
    "network more",
    "be authentic",
    "create quality content",
    "improve engagement",
  ];

  if (banned.some((phrase) => combined.includes(phrase))) {
    return false;
  }

  const markers = [
    context.fullName,
    context.niche,
    context.location,
    context.stage,
    context.archetype,
    context.primaryGoal,
    context.biggestChallenge,
    context.goals,
    context.dreamPartnerships,
    context.desiredOutcome,
    context.upcomingTravel,
    ...context.contentPillars,
    ...context.portfolioGaps,
    ...context.priorityFocusAreas,
  ]
    .map((m) => m.toLowerCase().trim())
    .filter((m) => m.length > 3);

  if (context.instagram) {
    markers.push(context.instagram.toLowerCase().replace("@", ""));
  }

  const hasSpecificReference = markers.some((marker) => combined.includes(marker));

  const actionVerbs = [
    "draft",
    "write",
    "audit",
    "list",
    "screenshot",
    "email",
    "outline",
    "update your",
    "create a",
    "review your",
    "identify",
    "research",
    "analyze",
    "document",
    "compile",
    "map",
    "refine",
    "edit",
    "prepare",
    "compare",
  ];

  const hasConcreteAction = actionVerbs.some((verb) => combined.includes(verb));

  return (
    hasSpecificReference ||
    (hasConcreteAction && instruction.length >= 50) ||
    instruction.length >= 90
  );
}

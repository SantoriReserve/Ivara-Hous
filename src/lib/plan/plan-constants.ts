export const PLAN_VERSION = "1.0.0" as const;
export const GENERATOR_VERSION = "gen-3b.1" as const;

export const PLAN_DAY_COUNT = 40;
export const PLAN_WEEK_COUNT = 6;

export const PLAN_STATUSES = ["generating", "active", "completed", "failed"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export const TASK_TYPES = ["action", "research", "create", "review", "reflect"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const FOCUS_AREAS = [
  "portfolio",
  "content",
  "positioning",
  "outreach",
  "partnerships",
  "brand",
  "audience",
  "skills",
] as const;
export type FocusArea = (typeof FOCUS_AREAS)[number];

export const COMPLETION_STATUSES = ["not_started", "completed", "skipped"] as const;
export type CompletionStatus = (typeof COMPLETION_STATUSES)[number];

export const TASKS_PER_DAY_MIN = 3;
export const TASKS_PER_DAY_MAX = 5;

export const DEFAULT_PLAN_MODEL = "gpt-4o";

export function weekNumberForDay(dayNumber: number): number {
  return Math.min(PLAN_WEEK_COUNT, Math.ceil(dayNumber / 7));
}

export function weekDayRange(weekNumber: number): { startDay: number; endDay: number } {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = Math.min(PLAN_DAY_COUNT, weekNumber * 7);
  return { startDay, endDay };
}

import { z } from "zod";
import {
  FOCUS_AREAS,
  PLAN_DAY_COUNT,
  PLAN_WEEK_COUNT,
  TASK_TYPES,
  TASKS_PER_DAY_MAX,
  TASKS_PER_DAY_MIN,
  type TaskType,
} from "@/lib/plan/plan-constants";

export const planSummarySchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  primaryGoal: z.string().min(1),
  creatorStage: z.string().min(1),
  creatorArchetype: z.string().min(1),
  idealPartnershipTier: z.string().min(1),
});

export type PlanSummary = z.infer<typeof planSummarySchema>;

const focusAreaSchema = z.enum(FOCUS_AREAS);
const taskTypeSchema = z.enum(TASK_TYPES);

export const planBlueprintDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(PLAN_DAY_COUNT),
  weekNumber: z.number().int().min(1).max(PLAN_WEEK_COUNT),
  title: z.string().min(1),
  objective: z.string().min(1),
  focusArea: focusAreaSchema,
  estimatedMinutes: z.number().int().min(15).max(180),
});

export const planBlueprintSchema = z.object({
  planSummary: planSummarySchema,
  days: z.array(planBlueprintDaySchema).length(PLAN_DAY_COUNT),
});

export type PlanBlueprint = z.infer<typeof planBlueprintSchema>;

export const planWeekSchema = z.object({
  weekNumber: z.number().int().min(1).max(PLAN_WEEK_COUNT),
  title: z.string().min(1),
  milestone: z.string().min(1),
  successCriteria: z.string().min(1),
  startDay: z.number().int().min(1).max(PLAN_DAY_COUNT),
  endDay: z.number().int().min(1).max(PLAN_DAY_COUNT),
});

export const planWeeksSchema = z.object({
  weeks: z.array(planWeekSchema).length(PLAN_WEEK_COUNT),
});

export type PlanWeeksOutput = z.infer<typeof planWeeksSchema>;

export const planDayTaskSchema = z.object({
  taskOrder: z.number().int().min(1).max(TASKS_PER_DAY_MAX),
  taskType: taskTypeSchema,
  title: z.string().min(1),
  instruction: z.string().min(40),
  deliverable: z.string().min(1),
  successCriteria: z.string().min(1),
  isRequired: z.boolean(),
});

export const planDayTasksBatchDaySchema = z.object({
  dayNumber: z.number().int().min(1).max(PLAN_DAY_COUNT),
  tasks: z
    .array(planDayTaskSchema)
    .min(TASKS_PER_DAY_MIN)
    .max(TASKS_PER_DAY_MAX),
});

export const planDayTasksBatchSchema = z.object({
  days: z.array(planDayTasksBatchDaySchema).min(1),
});

export type PlanDayTasksBatch = z.infer<typeof planDayTasksBatchSchema>;

export type PlanInstanceRecord = {
  id: string;
  userId: string;
  purchaseId: string;
  assessmentId: string;
  productSlug: string;
  status: "generating" | "active" | "completed" | "failed";
  planVersion: string;
  generatorVersion: string;
  assessmentSchemaVersion: string;
  startDate: string;
  currentFocusDay: number;
  totalRequiredTasks: number;
  completedRequiredTasks: number;
  completionPercentage: number;
  completedAt: string | null;
  planSummary: PlanSummary;
  createdAt: string;
  updatedAt: string;
};

export type PlanWeekRecord = {
  id: string;
  planInstanceId: string;
  weekNumber: number;
  title: string;
  milestone: string;
  successCriteria: string;
  startDay: number;
  endDay: number;
};

export type PlanDayRecord = {
  id: string;
  planInstanceId: string;
  dayNumber: number;
  weekNumber: number;
  title: string;
  objective: string;
  focusArea: string;
  estimatedMinutes: number;
};

export type PlanDayTaskRecord = {
  id: string;
  planInstanceId: string;
  planDayId: string;
  taskOrder: number;
  taskType: TaskType;
  title: string;
  instruction: string;
  deliverable: string;
  successCriteria: string;
  isRequired: boolean;
};

export type PlanTaskCompletionRecord = {
  id: string;
  planInstanceId: string;
  planDayTaskId: string;
  userId: string;
  status: "not_started" | "completed" | "skipped";
  completedAt: string | null;
};

export type PlanDayWithTasks = PlanDayRecord & {
  tasks: Array<PlanDayTaskRecord & { completionStatus: "not_started" | "completed" | "skipped" }>;
};

export type PlanGraph = {
  instance: PlanInstanceRecord;
  weeks: PlanWeekRecord[];
  days: PlanDayRecord[];
  tasks: PlanDayTaskRecord[];
  completions: PlanTaskCompletionRecord[];
};

const focusAreaJson = { type: "string", enum: [...FOCUS_AREAS] };
const taskTypeJson = { type: "string", enum: [...TASK_TYPES] };

export const OPENAI_PLAN_BLUEPRINT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["planSummary", "days"],
  properties: {
    planSummary: {
      type: "object",
      additionalProperties: false,
      required: [
        "title",
        "subtitle",
        "primaryGoal",
        "creatorStage",
        "creatorArchetype",
        "idealPartnershipTier",
      ],
      properties: {
        title: { type: "string" },
        subtitle: { type: "string" },
        primaryGoal: { type: "string" },
        creatorStage: { type: "string" },
        creatorArchetype: { type: "string" },
        idealPartnershipTier: { type: "string" },
      },
    },
    days: {
      type: "array",
      minItems: PLAN_DAY_COUNT,
      maxItems: PLAN_DAY_COUNT,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "dayNumber",
          "weekNumber",
          "title",
          "objective",
          "focusArea",
          "estimatedMinutes",
        ],
        properties: {
          dayNumber: { type: "integer", minimum: 1, maximum: PLAN_DAY_COUNT },
          weekNumber: { type: "integer", minimum: 1, maximum: PLAN_WEEK_COUNT },
          title: { type: "string" },
          objective: { type: "string" },
          focusArea: focusAreaJson,
          estimatedMinutes: { type: "integer", minimum: 15, maximum: 180 },
        },
      },
    },
  },
} as const;

export const OPENAI_PLAN_WEEKS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["weeks"],
  properties: {
    weeks: {
      type: "array",
      minItems: PLAN_WEEK_COUNT,
      maxItems: PLAN_WEEK_COUNT,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "weekNumber",
          "title",
          "milestone",
          "successCriteria",
          "startDay",
          "endDay",
        ],
        properties: {
          weekNumber: { type: "integer", minimum: 1, maximum: PLAN_WEEK_COUNT },
          title: { type: "string" },
          milestone: { type: "string" },
          successCriteria: { type: "string" },
          startDay: { type: "integer", minimum: 1, maximum: PLAN_DAY_COUNT },
          endDay: { type: "integer", minimum: 1, maximum: PLAN_DAY_COUNT },
        },
      },
    },
  },
} as const;

export const OPENAI_PLAN_DAY_TASKS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["days"],
  properties: {
    days: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["dayNumber", "tasks"],
        properties: {
          dayNumber: { type: "integer", minimum: 1, maximum: PLAN_DAY_COUNT },
          tasks: {
            type: "array",
            minItems: TASKS_PER_DAY_MIN,
            maxItems: TASKS_PER_DAY_MAX,
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "taskOrder",
                "taskType",
                "title",
                "instruction",
                "deliverable",
                "successCriteria",
                "isRequired",
              ],
              properties: {
                taskOrder: { type: "integer", minimum: 1, maximum: TASKS_PER_DAY_MAX },
                taskType: taskTypeJson,
                title: { type: "string" },
                instruction: { type: "string" },
                deliverable: { type: "string" },
                successCriteria: { type: "string" },
                isRequired: { type: "boolean" },
              },
            },
          },
        },
      },
    },
  },
} as const;

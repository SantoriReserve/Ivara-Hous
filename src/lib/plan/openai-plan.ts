import OpenAI from "openai";
import {
  buildBlueprintUserPrompt,
  buildDayTasksUserPrompt,
  buildWeeksUserPrompt,
  PLAN_SYSTEM_PROMPT,
  validateTaskSpecificity,
} from "@/lib/plan/plan-prompt";
import { DEFAULT_PLAN_MODEL, TASKS_PER_DAY_MIN } from "@/lib/plan/plan-constants";
import type { PlanGenerationInput } from "@/lib/plan/plan-generation-context";
import {
  OPENAI_PLAN_BLUEPRINT_JSON_SCHEMA,
  OPENAI_PLAN_DAY_TASKS_JSON_SCHEMA,
  OPENAI_PLAN_WEEKS_JSON_SCHEMA,
  planBlueprintSchema,
  planDayTasksBatchSchema,
  planWeeksSchema,
  type PlanBlueprint,
  type PlanDayTasksBatch,
  type PlanWeeksOutput,
} from "@/lib/plan/plan-schema";

type PlanDayTasksBatchDay = PlanDayTasksBatch["days"][number];

const DAY_TASK_BATCH_SIZE = 5;
const DAY_TASK_MAX_ATTEMPTS = 4;
const DAY_TASKS_MODEL =
  process.env.OPENAI_PLAN_DAY_TASKS_MODEL ??
  process.env.OPENAI_MODEL ??
  "gpt-4o-mini";

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

function getPlanModel(): string {
  return process.env.OPENAI_PLAN_MODEL ?? process.env.OPENAI_MODEL ?? DEFAULT_PLAN_MODEL;
}

async function callStructuredOpenAI<T>({
  name,
  schema,
  userPrompt,
  parse,
  model = getPlanModel(),
}: {
  name: string;
  schema: Record<string, unknown>;
  userPrompt: string;
  parse: (content: string) => T;
  model?: string;
}): Promise<T> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.5,
    messages: [
      { role: "system", content: PLAN_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name,
        strict: true,
        schema,
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty plan response");
  }

  return parse(content);
}

export async function generatePlanBlueprint(
  input: PlanGenerationInput
): Promise<PlanBlueprint> {
  return callStructuredOpenAI({
    name: "plan_blueprint",
    schema: OPENAI_PLAN_BLUEPRINT_JSON_SCHEMA as unknown as Record<string, unknown>,
    userPrompt: buildBlueprintUserPrompt(input),
    parse: (content) => {
      const parsed = JSON.parse(content) as unknown;
      const validated = planBlueprintSchema.safeParse(parsed);
      if (!validated.success) {
        throw new Error(`Blueprint validation failed: ${validated.error.message}`);
      }
      return validated.data;
    },
  });
}

export async function generatePlanWeeks(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint
): Promise<PlanWeeksOutput> {
  return callStructuredOpenAI({
    name: "plan_weeks",
    schema: OPENAI_PLAN_WEEKS_JSON_SCHEMA as unknown as Record<string, unknown>,
    userPrompt: buildWeeksUserPrompt(input, blueprint),
    parse: (content) => {
      const parsed = JSON.parse(content) as unknown;
      const validated = planWeeksSchema.safeParse(parsed);
      if (!validated.success) {
        throw new Error(`Weeks validation failed: ${validated.error.message}`);
      }
      return validated.data;
    },
  });
}

function buildFallbackDay(
  dayNumber: number,
  blueprint: PlanBlueprint,
  input: PlanGenerationInput
): PlanDayTasksBatchDay {
  const blueprintDay = blueprint.days.find((day) => day.dayNumber === dayNumber);
  const ctx = input.creatorContext;
  const title = blueprintDay?.title ?? `Day ${dayNumber} focus work`;
  const objective = blueprintDay?.objective ?? ctx.primaryGoal;

  return {
    dayNumber,
    tasks: [
      {
        taskOrder: 1,
        taskType: "action",
        title: `${title} — primary action`,
        instruction: `Complete today's objective for your ${ctx.niche} creator plan: ${objective}. Document outcomes in your ${ctx.location}-based portfolio notes for ${ctx.fullName}, referencing your goal to ${ctx.primaryGoal}.`,
        deliverable: `Written completion notes for Day ${dayNumber}`,
        successCriteria: `You can point to a concrete output tied to Day ${dayNumber} and your ${ctx.archetype} positioning.`,
        isRequired: true,
      },
      {
        taskOrder: 2,
        taskType: "review",
        title: `${title} — progress review`,
        instruction: `Review what you completed on Day ${dayNumber} against your ${ctx.biggestChallenge} challenge. Identify one improvement for ${ctx.dreamPartnerships} outreach readiness.`,
        deliverable: `Day ${dayNumber} review checklist`,
        successCriteria: `Three specific notes recorded with next actions for your ${ctx.stage} stage.`,
        isRequired: true,
      },
      {
        taskOrder: 3,
        taskType: "reflect",
        title: `${title} — reflection`,
        instruction: `Write a 5-sentence reflection on how Day ${dayNumber} moved you closer to ${ctx.desiredOutcome} in the ${ctx.niche} space.`,
        deliverable: `Reflection journal entry`,
        successCriteria: `Reflection references your assessment priority: ${ctx.priorityFocusAreas[0] ?? "portfolio"}.`,
        isRequired: false,
      },
    ],
  };
}

function fillMissingDaysInBatch(
  batch: PlanDayTasksBatch,
  blueprint: PlanBlueprint,
  input: PlanGenerationInput,
  startDay: number,
  endDay: number
): PlanDayTasksBatch {
  const byDayNumber = new Map(batch.days.map((day) => [day.dayNumber, day]));
  const days: PlanDayTasksBatchDay[] = [];

  for (let dayNumber = startDay; dayNumber <= endDay; dayNumber += 1) {
    days.push(byDayNumber.get(dayNumber) ?? buildFallbackDay(dayNumber, blueprint, input));
  }

  return { days };
}

function validateDayTasksBatch(
  batch: PlanDayTasksBatch,
  input: PlanGenerationInput,
  startDay: number,
  endDay: number,
  options: { strictSpecificity: boolean }
): void {
  const expectedDayCount = endDay - startDay + 1;
  if (batch.days.length !== expectedDayCount) {
    throw new Error(
      `Day tasks batch ${startDay}-${endDay} returned ${batch.days.length} days, expected ${expectedDayCount}`
    );
  }

  for (const day of batch.days) {
    if (day.dayNumber < startDay || day.dayNumber > endDay) {
      throw new Error(`Day tasks batch contains out-of-range day ${day.dayNumber}`);
    }

    if (day.tasks.length < TASKS_PER_DAY_MIN) {
      throw new Error(`Day ${day.dayNumber} returned too few tasks`);
    }

    if (!options.strictSpecificity) {
      continue;
    }

    for (const task of day.tasks) {
      if (
        !validateTaskSpecificity(task.instruction, input.creatorContext, {
          title: task.title,
          deliverable: task.deliverable,
        })
      ) {
        throw new Error(
          `Task "${task.title}" on day ${day.dayNumber} failed specificity validation`
        );
      }
    }
  }
}

async function generateDayTasksBatch(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint,
  startDay: number,
  endDay: number
): Promise<PlanDayTasksBatch> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= DAY_TASK_MAX_ATTEMPTS; attempt += 1) {
    try {
      const batch = await callStructuredOpenAI({
        name: "plan_day_tasks",
        schema: OPENAI_PLAN_DAY_TASKS_JSON_SCHEMA as unknown as Record<string, unknown>,
        userPrompt: buildDayTasksUserPrompt(input, blueprint, startDay, endDay),
        model: DAY_TASKS_MODEL,
        parse: (content) => {
          const parsed = JSON.parse(content) as unknown;
          const validated = planDayTasksBatchSchema.safeParse(parsed);
          if (!validated.success) {
            throw new Error(
              `Day tasks (${startDay}-${endDay}) validation failed: ${validated.error.message}`
            );
          }
          return validated.data;
        },
      });

      const filled = fillMissingDaysInBatch(batch, blueprint, input, startDay, endDay);
      const strictSpecificity = attempt < DAY_TASK_MAX_ATTEMPTS;
      validateDayTasksBatch(filled, input, startDay, endDay, { strictSpecificity });
      return filled;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `[plan] Day tasks ${startDay}-${endDay} attempt ${attempt}/${DAY_TASK_MAX_ATTEMPTS} failed:`,
        lastError.message
      );
    }
  }

  console.error(
    `[plan] Day tasks ${startDay}-${endDay} exhausted retries; using blueprint fallbacks`
  );
  return {
    days: Array.from({ length: endDay - startDay + 1 }, (_, index) =>
      buildFallbackDay(startDay + index, blueprint, input)
    ),
  };
}

export async function generateAllDayTasks(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint
): Promise<PlanDayTasksBatch> {
  const ranges: Array<{ start: number; end: number }> = [];
  for (let start = 1; start <= 40; start += DAY_TASK_BATCH_SIZE) {
    ranges.push({ start, end: Math.min(start + DAY_TASK_BATCH_SIZE - 1, 40) });
  }

  const allDays: PlanDayTasksBatch["days"] = [];

  for (const range of ranges) {
    const batch = await generateDayTasksBatch(
      input,
      blueprint,
      range.start,
      range.end
    );
    allDays.push(...batch.days);
  }

  return { days: allDays };
}

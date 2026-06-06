import OpenAI from "openai";
import {
  buildBlueprintUserPrompt,
  buildDayTasksUserPrompt,
  buildWeeksUserPrompt,
  PLAN_SYSTEM_PROMPT,
  validateTaskSpecificity,
} from "@/lib/plan/plan-prompt";
import { DEFAULT_PLAN_MODEL } from "@/lib/plan/plan-constants";
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
}: {
  name: string;
  schema: Record<string, unknown>;
  userPrompt: string;
  parse: (content: string) => T;
}): Promise<T> {
  const client = getOpenAIClient();
  const model = getPlanModel();

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

function validateDayTasksBatch(
  batch: PlanDayTasksBatch,
  input: PlanGenerationInput,
  startDay: number,
  endDay: number
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

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const batch = await callStructuredOpenAI({
        name: "plan_day_tasks",
        schema: OPENAI_PLAN_DAY_TASKS_JSON_SCHEMA as unknown as Record<string, unknown>,
        userPrompt: buildDayTasksUserPrompt(input, blueprint, startDay, endDay),
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

      validateDayTasksBatch(batch, input, startDay, endDay);
      return batch;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error(`Day tasks (${startDay}-${endDay}) generation failed`);
}

export async function generateAllDayTasks(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint
): Promise<PlanDayTasksBatch> {
  const ranges = [
    { start: 1, end: 10 },
    { start: 11, end: 20 },
    { start: 21, end: 30 },
    { start: 31, end: 40 },
  ] as const;

  const allDays: PlanDayTasksBatch["days"] = [];

  for (const range of ranges) {
    const batch = await generateDayTasksBatch(input, blueprint, range.start, range.end);
    allDays.push(...batch.days);
  }

  return { days: allDays };
}

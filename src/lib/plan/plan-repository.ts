import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  PlanDayRecord,
  PlanDayTaskRecord,
  PlanDayWithTasks,
  PlanGraph,
  PlanInstanceRecord,
  PlanSummary,
  PlanTaskCompletionRecord,
  PlanWeekRecord,
} from "@/lib/plan/plan-schema";
import type { PlanBlueprint, PlanDayTasksBatch, PlanWeeksOutput } from "@/lib/plan/plan-schema";
import { GENERATOR_VERSION, PLAN_VERSION } from "@/lib/plan/plan-constants";

type PlanInstanceRow = {
  id: string;
  user_id: string;
  purchase_id: string;
  assessment_id: string;
  product_slug: string;
  status: PlanInstanceRecord["status"];
  plan_version: string;
  generator_version: string;
  assessment_schema_version: string;
  start_date: string;
  current_focus_day: number;
  total_required_tasks: number;
  completed_required_tasks: number;
  completion_percentage: number;
  completed_at: string | null;
  plan_summary: PlanSummary;
  created_at: string;
  updated_at: string;
};

function mapPlanInstanceRow(row: PlanInstanceRow): PlanInstanceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    purchaseId: row.purchase_id,
    assessmentId: row.assessment_id,
    productSlug: row.product_slug,
    status: row.status,
    planVersion: row.plan_version,
    generatorVersion: row.generator_version,
    assessmentSchemaVersion: row.assessment_schema_version,
    startDate: row.start_date,
    currentFocusDay: row.current_focus_day,
    totalRequiredTasks: row.total_required_tasks,
    completedRequiredTasks: row.completed_required_tasks,
    completionPercentage: Number(row.completion_percentage),
    completedAt: row.completed_at,
    planSummary: row.plan_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPlanByPurchaseId(
  purchaseId: string
): Promise<PlanInstanceRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .select("*")
    .eq("purchase_id", purchaseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load plan by purchase: ${error.message}`);
  }

  return data ? mapPlanInstanceRow(data as PlanInstanceRow) : null;
}

export async function getActivePlanForUser(
  userId: string
): Promise<PlanInstanceRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user plan: ${error.message}`);
  }

  return data ? mapPlanInstanceRow(data as PlanInstanceRow) : null;
}

export async function getPlanById(planInstanceId: string): Promise<PlanInstanceRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .select("*")
    .eq("id", planInstanceId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load plan: ${error.message}`);
  }

  return data ? mapPlanInstanceRow(data as PlanInstanceRow) : null;
}

export async function createGeneratingPlanInstance(params: {
  userId: string;
  purchaseId: string;
  assessmentId: string;
  productSlug: string;
  assessmentSchemaVersion: string;
  planSummary: PlanSummary;
}): Promise<{ plan: PlanInstanceRecord; created: boolean } | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .insert({
      user_id: params.userId,
      purchase_id: params.purchaseId,
      assessment_id: params.assessmentId,
      product_slug: params.productSlug,
      status: "generating",
      plan_version: PLAN_VERSION,
      generator_version: GENERATOR_VERSION,
      assessment_schema_version: params.assessmentSchemaVersion,
      plan_summary: params.planSummary,
      start_date: new Date().toISOString().slice(0, 10),
    })
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      const existing = await getPlanByPurchaseId(params.purchaseId);
      return existing ? { plan: existing, created: false } : null;
    }
    throw new Error(`Failed to create plan instance: ${error.message}`);
  }

  return data
    ? { plan: mapPlanInstanceRow(data as PlanInstanceRow), created: true }
    : null;
}

export async function planHasGeneratedContent(planInstanceId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("plan_days")
    .select("id", { count: "exact", head: true })
    .eq("plan_instance_id", planInstanceId);

  if (error) {
    throw new Error(`Failed to check plan content: ${error.message}`);
  }

  return (count ?? 0) > 0;
}

export async function markPlanFailed(planInstanceId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("plan_instances")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", planInstanceId);

  if (error) {
    throw new Error(`Failed to mark plan as failed: ${error.message}`);
  }
}

export async function persistPlanGraph(params: {
  planInstanceId: string;
  blueprint: PlanBlueprint;
  weeks: PlanWeeksOutput;
  dayTasks: PlanDayTasksBatch;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { planInstanceId, blueprint, weeks, dayTasks } = params;

  const dayIdByNumber = new Map<number, string>();

  const weekRows = weeks.weeks.map((week) => ({
    plan_instance_id: planInstanceId,
    week_number: week.weekNumber,
    title: week.title,
    milestone: week.milestone,
    success_criteria: week.successCriteria,
    start_day: week.startDay,
    end_day: week.endDay,
  }));

  const { error: weeksError } = await supabase.from("plan_weeks").insert(weekRows);
  if (weeksError) {
    throw new Error(`Failed to insert plan weeks: ${weeksError.message}`);
  }

  const dayRows = blueprint.days.map((day) => ({
    plan_instance_id: planInstanceId,
    day_number: day.dayNumber,
    week_number: day.weekNumber,
    title: day.title,
    objective: day.objective,
    focus_area: day.focusArea,
    estimated_minutes: day.estimatedMinutes,
  }));

  const { data: insertedDays, error: daysError } = await supabase
    .from("plan_days")
    .insert(dayRows)
    .select("id, day_number");

  if (daysError) {
    throw new Error(`Failed to insert plan days: ${daysError.message}`);
  }

  for (const row of insertedDays ?? []) {
    dayIdByNumber.set(row.day_number, row.id);
  }

  const taskRows = dayTasks.days.flatMap((dayBatch) => {
    const planDayId = dayIdByNumber.get(dayBatch.dayNumber);
    if (!planDayId) {
      throw new Error(`Missing plan day id for day ${dayBatch.dayNumber}`);
    }

    return dayBatch.tasks.map((task) => ({
      plan_instance_id: planInstanceId,
      plan_day_id: planDayId,
      task_order: task.taskOrder,
      task_type: task.taskType,
      title: task.title,
      instruction: task.instruction,
      deliverable: task.deliverable,
      success_criteria: task.successCriteria,
      is_required: task.isRequired,
    }));
  });

  const { error: tasksError } = await supabase.from("plan_day_tasks").insert(taskRows);
  if (tasksError) {
    throw new Error(`Failed to insert plan tasks: ${tasksError.message}`);
  }

  const totalRequired = taskRows.filter((t) => t.is_required).length;

  const { error: activateError } = await supabase
    .from("plan_instances")
    .update({
      status: "active",
      plan_summary: blueprint.planSummary,
      total_required_tasks: totalRequired,
      completed_required_tasks: 0,
      completion_percentage: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planInstanceId);

  if (activateError) {
    throw new Error(`Failed to activate plan: ${activateError.message}`);
  }

  await supabase.rpc("recompute_plan_completion", { p_plan_instance_id: planInstanceId });
}

export async function getPlanGraph(planInstanceId: string): Promise<PlanGraph | null> {
  const supabase = getSupabaseAdmin();

  const { data: instance, error: instanceError } = await supabase
    .from("plan_instances")
    .select("*")
    .eq("id", planInstanceId)
    .maybeSingle();

  if (instanceError) {
    throw new Error(`Failed to load plan instance: ${instanceError.message}`);
  }
  if (!instance) {
    return null;
  }

  const [weeksRes, daysRes, tasksRes, completionsRes] = await Promise.all([
    supabase
      .from("plan_weeks")
      .select("*")
      .eq("plan_instance_id", planInstanceId)
      .order("week_number"),
    supabase
      .from("plan_days")
      .select("*")
      .eq("plan_instance_id", planInstanceId)
      .order("day_number"),
    supabase
      .from("plan_day_tasks")
      .select("*")
      .eq("plan_instance_id", planInstanceId)
      .order("task_order"),
    supabase
      .from("plan_task_completions")
      .select("*")
      .eq("plan_instance_id", planInstanceId),
  ]);

  if (weeksRes.error) throw new Error(weeksRes.error.message);
  if (daysRes.error) throw new Error(daysRes.error.message);
  if (tasksRes.error) throw new Error(tasksRes.error.message);
  if (completionsRes.error) throw new Error(completionsRes.error.message);

  return {
    instance: mapPlanInstanceRow(instance as PlanInstanceRow),
    weeks: (weeksRes.data ?? []).map(
      (w): PlanWeekRecord => ({
        id: w.id,
        planInstanceId: w.plan_instance_id,
        weekNumber: w.week_number,
        title: w.title,
        milestone: w.milestone,
        successCriteria: w.success_criteria,
        startDay: w.start_day,
        endDay: w.end_day,
      })
    ),
    days: (daysRes.data ?? []).map(
      (d): PlanDayRecord => ({
        id: d.id,
        planInstanceId: d.plan_instance_id,
        dayNumber: d.day_number,
        weekNumber: d.week_number,
        title: d.title,
        objective: d.objective,
        focusArea: d.focus_area,
        estimatedMinutes: d.estimated_minutes,
      })
    ),
    tasks: (tasksRes.data ?? []).map(
      (t): PlanDayTaskRecord => ({
        id: t.id,
        planInstanceId: t.plan_instance_id,
        planDayId: t.plan_day_id,
        taskOrder: t.task_order,
        taskType: t.task_type,
        title: t.title,
        instruction: t.instruction,
        deliverable: t.deliverable,
        successCriteria: t.success_criteria,
        isRequired: t.is_required,
      })
    ),
    completions: (completionsRes.data ?? []).map(
      (c): PlanTaskCompletionRecord => ({
        id: c.id,
        planInstanceId: c.plan_instance_id,
        planDayTaskId: c.plan_day_task_id,
        userId: c.user_id,
        status: c.status,
        completedAt: c.completed_at,
      })
    ),
  };
}

export async function getDayWithTasks(
  planInstanceId: string,
  dayNumber: number,
  userId: string
): Promise<PlanDayWithTasks | null> {
  const graph = await getPlanGraph(planInstanceId);
  if (!graph) return null;

  const day = graph.days.find((d) => d.dayNumber === dayNumber);
  if (!day) return null;

  const completionByTask = new Map(
    graph.completions
      .filter((c) => c.userId === userId)
      .map((c) => [c.planDayTaskId, c.status])
  );

  const tasks = graph.tasks
    .filter((t) => t.planDayId === day.id)
    .sort((a, b) => a.taskOrder - b.taskOrder)
    .map((task) => ({
      ...task,
      completionStatus: completionByTask.get(task.id) ?? ("not_started" as const),
    }));

  return { ...day, tasks };
}

export async function updateCurrentFocusDay(
  planInstanceId: string,
  dayNumber: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("plan_instances")
    .update({
      current_focus_day: dayNumber,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planInstanceId);

  if (error) {
    throw new Error(`Failed to update focus day: ${error.message}`);
  }
}

export async function getDayCompletionSummaries(planInstanceId: string): Promise<
  Array<{
    dayNumber: number;
    title: string;
    focusArea: string;
    weekNumber: number;
    totalTasks: number;
    completedTasks: number;
    isComplete: boolean;
  }>
> {
  const graph = await getPlanGraph(planInstanceId);
  if (!graph) return [];

  const completedTaskIds = new Set(
    graph.completions.filter((c) => c.status === "completed").map((c) => c.planDayTaskId)
  );

  return graph.days.map((day) => {
    const dayTasks = graph.tasks.filter(
      (t) => t.planDayId === day.id && t.isRequired
    );
    const completed = dayTasks.filter((t) => completedTaskIds.has(t.id)).length;

    return {
      dayNumber: day.dayNumber,
      title: day.title,
      focusArea: day.focusArea,
      weekNumber: day.weekNumber,
      totalTasks: dayTasks.length,
      completedTasks: completed,
      isComplete: dayTasks.length > 0 && completed === dayTasks.length,
    };
  });
}

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPlanById } from "@/lib/plan/plan-repository";
import type { PlanInstanceRecord } from "@/lib/plan/plan-schema";

export type TaskCompletionResult = {
  completionPercentage: number;
  completedRequiredTasks: number;
  totalRequiredTasks: number;
  planStatus: PlanInstanceRecord["status"];
  justCompletedPlan: boolean;
};

export async function completeTask(
  userId: string,
  planDayTaskId: string
): Promise<TaskCompletionResult> {
  const supabase = getSupabaseAdmin();

  const { data: task, error: taskError } = await supabase
    .from("plan_day_tasks")
    .select("id, plan_instance_id, is_required")
    .eq("id", planDayTaskId)
    .maybeSingle();

  if (taskError) {
    throw new Error(`Failed to load task: ${taskError.message}`);
  }
  if (!task) {
    throw new Error("Task not found");
  }

  const plan = await getPlanById(task.plan_instance_id);
  if (!plan || plan.userId !== userId) {
    throw new Error("Unauthorized task access");
  }

  const wasComplete = plan.completionPercentage >= 100;

  const { error: upsertError } = await supabase.from("plan_task_completions").upsert(
    {
      plan_instance_id: task.plan_instance_id,
      plan_day_task_id: planDayTaskId,
      user_id: userId,
      status: "completed",
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "plan_day_task_id,user_id" }
  );

  if (upsertError) {
    throw new Error(`Failed to complete task: ${upsertError.message}`);
  }

  const updated = await getPlanById(task.plan_instance_id);
  if (!updated) {
    throw new Error("Failed to reload plan after completion");
  }

  return {
    completionPercentage: updated.completionPercentage,
    completedRequiredTasks: updated.completedRequiredTasks,
    totalRequiredTasks: updated.totalRequiredTasks,
    planStatus: updated.status,
    justCompletedPlan: !wasComplete && updated.completionPercentage >= 100,
  };
}

export async function uncompleteTask(
  userId: string,
  planDayTaskId: string
): Promise<TaskCompletionResult> {
  const supabase = getSupabaseAdmin();

  const { data: task, error: taskError } = await supabase
    .from("plan_day_tasks")
    .select("id, plan_instance_id")
    .eq("id", planDayTaskId)
    .maybeSingle();

  if (taskError) {
    throw new Error(`Failed to load task: ${taskError.message}`);
  }
  if (!task) {
    throw new Error("Task not found");
  }

  const plan = await getPlanById(task.plan_instance_id);
  if (!plan || plan.userId !== userId) {
    throw new Error("Unauthorized task access");
  }

  const { error: deleteError } = await supabase
    .from("plan_task_completions")
    .delete()
    .eq("plan_day_task_id", planDayTaskId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(`Failed to uncomplete task: ${deleteError.message}`);
  }

  const updated = await getPlanById(task.plan_instance_id);
  if (!updated) {
    throw new Error("Failed to reload plan after uncomplete");
  }

  return {
    completionPercentage: updated.completionPercentage,
    completedRequiredTasks: updated.completedRequiredTasks,
    totalRequiredTasks: updated.totalRequiredTasks,
    planStatus: updated.status,
    justCompletedPlan: false,
  };
}

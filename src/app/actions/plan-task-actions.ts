"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/require-user";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import { completeTask, uncompleteTask } from "@/lib/plan/plan-progress-repository";
import { ROUTES } from "@/lib/constants";

export type TaskActionResult =
  | {
      success: true;
      completionPercentage: number;
      justCompletedPlan: boolean;
    }
  | { success: false; error: string };

async function assertPaidUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const hasAccess = await userHasPaidDashboardAccess(user.id);
  if (!hasAccess) {
    throw new Error("Forbidden");
  }

  return user;
}

function revalidateDashboardPaths() {
  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.dashboardToday);
  revalidatePath(ROUTES.dashboardPlan);
  revalidatePath(ROUTES.dashboardCongratulations);
}

export async function completePlanTask(taskId: string): Promise<TaskActionResult> {
  try {
    const user = await assertPaidUser();
    const result = await completeTask(user.id, taskId);
    revalidateDashboardPaths();

    return {
      success: true,
      completionPercentage: result.completionPercentage,
      justCompletedPlan: result.justCompletedPlan,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete task",
    };
  }
}

export async function uncompletePlanTask(taskId: string): Promise<TaskActionResult> {
  try {
    const user = await assertPaidUser();
    const result = await uncompleteTask(user.id, taskId);
    revalidateDashboardPaths();

    return {
      success: true,
      completionPercentage: result.completionPercentage,
      justCompletedPlan: result.justCompletedPlan,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to uncomplete task",
    };
  }
}

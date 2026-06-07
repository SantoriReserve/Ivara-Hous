"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/require-user";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import {
  upsertContentProgress,
  saveLearningResponse,
  type ContentIdeaProgress,
} from "@/lib/dashboard/dashboard-engagement-repository";
import { ROUTES } from "@/lib/constants";

type ActionResult = { success: true } | { success: false; error: string };

async function assertPaidUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const hasAccess = await userHasPaidDashboardAccess(user.id);
  if (!hasAccess) throw new Error("Forbidden");
  return user;
}

function revalidateEngagementPaths() {
  revalidatePath(ROUTES.dashboardContentIdeas);
  revalidatePath(ROUTES.dashboardToday);
  revalidatePath(ROUTES.dashboardWins);
}

export async function updateContentIdeaProgress(
  progress: ContentIdeaProgress
): Promise<ActionResult> {
  try {
    const user = await assertPaidUser();
    await upsertContentProgress(user.id, progress);
    revalidateEngagementPaths();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save progress",
    };
  }
}

export async function saveLearningInsight(params: {
  insightId: string;
  dayNumber: number;
  prompt: string;
  response: string;
}): Promise<ActionResult> {
  try {
    const user = await assertPaidUser();
    await saveLearningResponse(user.id, {
      insightId: params.insightId,
      dayNumber: params.dayNumber,
      prompt: params.prompt,
      response: params.response,
    });
    revalidatePath(ROUTES.dashboardToday);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save insight",
    };
  }
}

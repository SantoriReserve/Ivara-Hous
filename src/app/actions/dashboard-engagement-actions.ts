"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/require-user";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import { pickSwapContentIdea } from "@/lib/dashboard/content-daily";
import { getContentIdeas } from "@/lib/dashboard/content-ideas";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import {
  pinContentDaily,
  upsertContentProgress,
  saveLearningResponse,
  type ContentIdeaProgress,
} from "@/lib/dashboard/dashboard-engagement-repository";
import { ROUTES } from "@/lib/constants";

type ActionResult = { success: true } | { success: false; error: string };
type ContentActionResult =
  | { success: true; ideaId?: string }
  | { success: false; error: string };

async function assertPaidUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const hasAccess = await userHasPaidDashboardAccess(user.id);
  if (!hasAccess) throw new Error("Forbidden");
  return user;
}

function revalidateEngagementPaths() {
  revalidatePath(ROUTES.dashboard);
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

export async function pinContentToToday(
  dayNumber: number,
  ideaId: string
): Promise<ActionResult> {
  try {
    const user = await assertPaidUser();
    await pinContentDaily(user.id, dayNumber, ideaId);
    revalidateEngagementPaths();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to pin content",
    };
  }
}

export async function swapTodayContentRecommendation(
  dayNumber: number,
  currentIdeaId: string
): Promise<ContentActionResult> {
  try {
    const user = await assertPaidUser();
    const { creatorContext } = await getDashboardContext(user.id);
    if (!creatorContext) {
      return { success: false, error: "Creator context unavailable" };
    }

    const ideas = getContentIdeas(creatorContext);
    const nextIdea = pickSwapContentIdea(ideas, currentIdeaId, dayNumber);
    if (!nextIdea) {
      return { success: false, error: "No alternate content available" };
    }

    await pinContentDaily(user.id, dayNumber, nextIdea.id);
    revalidateEngagementPaths();
    return { success: true, ideaId: nextIdea.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to swap recommendation",
    };
  }
}

export async function markContentComplete(ideaId: string): Promise<ActionResult> {
  try {
    const user = await assertPaidUser();
    await upsertContentProgress(user.id, {
      ideaId,
      planned: true,
      filmed: true,
      edited: true,
      posted: true,
    });
    revalidateEngagementPaths();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark complete",
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

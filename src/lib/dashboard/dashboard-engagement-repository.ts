import { getSupabaseAdmin } from "@/lib/supabase/admin";

function isMissingEngagementTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("schema cache") ||
    lower.includes("content_idea_progress") ||
    lower.includes("content_daily_pins") ||
    lower.includes("learning_insight_responses")
  );
}

export type ContentIdeaProgress = {
  ideaId: string;
  planned: boolean;
  filmed: boolean;
  edited: boolean;
  posted: boolean;
};

export type LearningInsightResponse = {
  insightId: string;
  dayNumber: number | null;
  prompt: string;
  response: string;
};

export async function getContentProgressForUser(
  userId: string
): Promise<ContentIdeaProgress[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_idea_progress")
    .select("idea_id, planned, filmed, edited, posted")
    .eq("user_id", userId);

  if (error) {
    if (isMissingEngagementTableError(error.message)) return [];
    throw new Error(`Failed to load content progress: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    ideaId: row.idea_id,
    planned: row.planned,
    filmed: row.filmed,
    edited: row.edited,
    posted: row.posted,
  }));
}

export async function upsertContentProgress(
  userId: string,
  progress: ContentIdeaProgress
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("content_idea_progress").upsert(
    {
      user_id: userId,
      idea_id: progress.ideaId,
      planned: progress.planned,
      filmed: progress.filmed,
      edited: progress.edited,
      posted: progress.posted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,idea_id" }
  );

  if (error) {
    if (isMissingEngagementTableError(error.message)) return;
    throw new Error(`Failed to save content progress: ${error.message}`);
  }
}

export async function getContentDailyPin(
  userId: string,
  dayNumber: number
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("content_daily_pins")
    .select("idea_id")
    .eq("user_id", userId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) {
    if (isMissingEngagementTableError(error.message)) return null;
    throw new Error(`Failed to load daily content pin: ${error.message}`);
  }

  return data?.idea_id ?? null;
}

export async function pinContentDaily(
  userId: string,
  dayNumber: number,
  ideaId: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("content_daily_pins").upsert(
    {
      user_id: userId,
      day_number: dayNumber,
      idea_id: ideaId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,day_number" }
  );

  if (error) {
    if (isMissingEngagementTableError(error.message)) return;
    throw new Error(`Failed to pin daily content: ${error.message}`);
  }
}

export async function countPostedContent(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("content_idea_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("posted", true);

  if (error) {
    if (isMissingEngagementTableError(error.message)) return 0;
    throw new Error(`Failed to count content progress: ${error.message}`);
  }

  return count ?? 0;
}

export async function getLearningResponse(
  userId: string,
  insightId: string,
  dayNumber: number
): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("learning_insight_responses")
    .select("response")
    .eq("user_id", userId)
    .eq("insight_id", insightId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) {
    if (isMissingEngagementTableError(error.message)) return null;
    throw new Error(`Failed to load learning response: ${error.message}`);
  }

  return data?.response ?? null;
}

export async function saveLearningResponse(
  userId: string,
  params: LearningInsightResponse
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("learning_insight_responses").upsert(
    {
      user_id: userId,
      insight_id: params.insightId,
      day_number: params.dayNumber,
      prompt: params.prompt,
      response: params.response,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,insight_id,day_number" }
  );

  if (error) {
    if (isMissingEngagementTableError(error.message)) return;
    throw new Error(`Failed to save learning response: ${error.message}`);
  }
}

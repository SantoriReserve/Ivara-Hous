import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ProfileRecord = {
  id: string;
  email: string;
  fullName: string;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapProfileRow(row: ProfileRow): ProfileRecord {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    onboardingCompletedAt: row.onboarding_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfileByUserId(userId: string): Promise<ProfileRecord | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load profile: ${error.message}`);
  }

  return data ? mapProfileRow(data as ProfileRow) : null;
}

export async function updateProfileFullName(
  userId: string,
  fullName: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }
}

import type { User } from "@supabase/supabase-js";
import { normalizeEmail } from "@/lib/auth/normalize-email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/env";

/**
 * Look up a Supabase Auth user by email via the Admin API.
 */
export async function findAuthUserByEmail(email: string): Promise<User | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return null;
  }

  try {
    const url = new URL(`${getSupabaseUrl().replace(/\/$/, "")}/auth/v1/admin/users`);
    url.searchParams.set("email", normalized);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getSupabaseServiceRoleKey()}`,
        apikey: getSupabaseServiceRoleKey(),
      },
      cache: "no-store",
    });

    if (response.ok) {
      const payload = (await response.json()) as { users?: User[]; user?: User };
      const users = payload.users ?? (payload.user ? [payload.user] : []);
      const match = users.find(
        (user) => user.email && normalizeEmail(user.email) === normalized
      );
      if (match) {
        return match;
      }
    } else {
      const detail = await response.text().catch(() => "");
      console.warn("[auth] findAuthUserByEmail email filter failed:", response.status, detail);
    }
  } catch (error) {
    console.warn("[auth] findAuthUserByEmail email filter error:", error);
  }

  // Fallback: paginate admin listUsers (covers older GoTrue without email filter).
  const admin = getSupabaseAdmin();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      console.error("[auth] findAuthUserByEmail listUsers failed:", error.message);
      throw new Error(`Failed to look up auth user: ${error.message}`);
    }

    const match = data.users.find(
      (user) => user.email && normalizeEmail(user.email) === normalized
    );
    if (match) {
      return match;
    }

    if (data.users.length < 200) {
      break;
    }
  }

  return null;
}

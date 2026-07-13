import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfileByUserId } from "@/lib/auth/profile-repository";
import type { AuthUser } from "@/lib/auth/require-user";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";
import {
  ADMIN_PIN_COOKIE,
  verifyPinSessionToken,
} from "@/lib/admin/admin-pin-auth";

export type AdminAccessMode = "auth" | "pin";

export type AdminSession = {
  email: string;
  mode: AdminAccessMode;
};

export const ADMIN_EMAILS = [
  "anyjazminmatos@gmail.com",
  "anyjazminn@gmail.com",
  "info@ivarahous.com",
] as const;

/** Gmail ignores dots and plus-tags — normalize so allowlist matches real sign-ins. */
export function normalizeAdminEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf("@");
  if (atIndex <= 0) {
    return trimmed;
  }

  let local = trimmed.slice(0, atIndex);
  let domain = trimmed.slice(atIndex + 1);

  if (domain === "googlemail.com") {
    domain = "gmail.com";
  }

  if (domain === "gmail.com") {
    local = local.split("+")[0].replace(/\./g, "");
  }

  return `${local}@${domain}`;
}

function getAdminEmailSet(): Set<string> {
  const fromEnv = process.env.ADMIN_ALLOWED_EMAILS?.split(",") ?? [];
  const merged = [...ADMIN_EMAILS, ...fromEnv.map((email) => email.trim()).filter(Boolean)];
  return new Set(merged.map((email) => normalizeAdminEmail(email)));
}

export function getAdminAllowlist(): string[] {
  return [
    ...ADMIN_EMAILS,
    ...(process.env.ADMIN_ALLOWED_EMAILS?.split(",").map((e) => e.trim()).filter(Boolean) ?? []),
  ];
}

export function getAdminAllowlistNormalized(): string[] {
  return [...getAdminEmailSet()];
}

export function isAdminEmail(email: string): boolean {
  return getAdminEmailSet().has(normalizeAdminEmail(email));
}

export type AdminAuthDiagnostics = {
  userId: string;
  authUsersEmail: string;
  profilesEmail: string | null;
  authUsersNormalized: string;
  profilesNormalized: string | null;
  authorized: boolean;
  matchedVia: "auth.users.email" | "profiles.email" | null;
};

export async function getAdminAuthDiagnostics(): Promise<AdminAuthDiagnostics | null> {
  const user = await getCurrentUser();
  if (!user?.email) {
    return null;
  }

  const profile = await getProfileByUserId(user.id);
  const authNormalized = normalizeAdminEmail(user.email);
  const profileNormalized = profile?.email ? normalizeAdminEmail(profile.email) : null;

  const authMatch = isAdminEmail(user.email);
  const profileMatch = profile?.email ? isAdminEmail(profile.email) : false;

  return {
    userId: user.id,
    authUsersEmail: user.email,
    profilesEmail: profile?.email ?? null,
    authUsersNormalized: authNormalized,
    profilesNormalized: profileNormalized,
    authorized: authMatch || profileMatch,
    matchedVia: authMatch ? "auth.users.email" : profileMatch ? "profiles.email" : null,
  };
}

export async function hasAdminPinAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_PIN_COOKIE)?.value;
  if (!token) {
    return false;
  }
  return verifyPinSessionToken(token);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (await hasAdminPinAccess()) {
    return {
      email: "Owner Access",
      mode: "pin",
    };
  }

  const diagnostics = await getAdminAuthDiagnostics();
  if (!diagnostics?.authorized) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user?.email) {
    return null;
  }

  return {
    email: user.email,
    mode: "auth",
  };
}

export async function getAdminUser(): Promise<AuthUser | null> {
  const session = await getAdminSession();
  if (!session) {
    return null;
  }

  if (session.mode === "pin") {
    return {
      id: "admin-pin-owner",
      email: "info@ivarahous.com",
    };
  }

  return getCurrentUser();
}

export async function requireAdminUser(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (session) {
    return session;
  }

  const user = await getCurrentUser();
  if (user?.email) {
    redirect(ROUTES.adminAccessDenied);
  }

  redirect(`${ROUTES.adminGate}?next=${ROUTES.admin}`);
}

export const ADMIN_PIN_COOKIE = "ivara_admin_pin";
export const ADMIN_PIN_MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function getAdminAccessCode(): string {
  return process.env.ADMIN_ACCESS_CODE ?? "4488";
}

async function getPinSecret(): Promise<string> {
  return (
    process.env.ADMIN_PIN_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "ivara-admin-pin-dev-only"
  );
}

async function signPayload(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(await getPinSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function createPinSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const signature = await signPayload(issuedAt);
  return `${issuedAt}.${signature}`;
}

export async function verifyPinSessionToken(token: string): Promise<boolean> {
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) {
    return false;
  }

  const issuedMs = Number(issuedAt);
  if (Number.isNaN(issuedMs)) {
    return false;
  }

  const ageMs = Date.now() - issuedMs;
  if (ageMs < 0 || ageMs > ADMIN_PIN_MAX_AGE_SEC * 1000) {
    return false;
  }

  const expected = await signPayload(issuedAt);
  return signature === expected;
}

export function verifyAdminAccessCode(code: string): boolean {
  return code.trim() === getAdminAccessCode();
}

export function adminPinCookieOptions(token: string) {
  return {
    name: ADMIN_PIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ADMIN_PIN_MAX_AGE_SEC,
    path: "/",
  };
}

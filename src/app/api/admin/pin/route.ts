import { NextResponse } from "next/server";
import {
  ADMIN_PIN_COOKIE,
  adminPinCookieOptions,
  createPinSessionToken,
  verifyAdminAccessCode,
} from "@/lib/admin/admin-pin-auth";

export async function POST(request: Request) {
  let code = "";
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!verifyAdminAccessCode(code)) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const token = await createPinSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminPinCookieOptions(token));
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_PIN_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}

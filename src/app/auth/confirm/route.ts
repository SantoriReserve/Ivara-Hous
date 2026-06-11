import { type NextRequest, NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";

/** Alias for Supabase email templates that target /auth/confirm. */
export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = ROUTES.authCallback;

  if (!redirectUrl.searchParams.has("next")) {
    redirectUrl.searchParams.set("next", ROUTES.loginResetPassword);
  }

  return NextResponse.redirect(redirectUrl);
}

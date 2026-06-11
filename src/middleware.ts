import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_PIN_COOKIE, verifyPinSessionToken } from "@/lib/admin/admin-pin-auth";
import { ROUTES } from "@/lib/constants";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function isAdminPath(pathname: string): boolean {
  return pathname === ROUTES.admin || pathname.startsWith(`${ROUTES.admin}/`);
}

function isAdminPublicPath(pathname: string): boolean {
  return (
    pathname === ROUTES.adminGate ||
    pathname === ROUTES.adminAccessDenied ||
    pathname === "/api/admin/pin"
  );
}

function hasAuthCallbackParams(request: NextRequest): boolean {
  const { searchParams } = request.nextUrl;
  return (
    searchParams.has("code") ||
    (searchParams.has("token_hash") && searchParams.has("type"))
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (hasAuthCallbackParams(request) && pathname !== ROUTES.authCallback) {
    const callbackUrl = request.nextUrl.clone();
    if (
      !callbackUrl.searchParams.has("next") &&
      pathname === ROUTES.loginResetPassword
    ) {
      callbackUrl.searchParams.set("next", ROUTES.loginResetPassword);
    }
    callbackUrl.pathname = ROUTES.authCallback;
    return NextResponse.redirect(callbackUrl);
  }

  const { supabase, supabaseResponse } = await updateSupabaseSession(request);

  const requiresDashboardAuth =
    pathname === ROUTES.dashboard || pathname.startsWith(`${ROUTES.dashboard}/`);
  const requiresAdminAuth = isAdminPath(pathname) && !isAdminPublicPath(pathname);

  if (requiresDashboardAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = ROUTES.login;
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (requiresAdminAuth) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const pinToken = request.cookies.get(ADMIN_PIN_COOKIE)?.value;
    const hasPinAccess = pinToken ? await verifyPinSessionToken(pinToken) : false;

    if (!user && !hasPinAccess) {
      const gateUrl = request.nextUrl.clone();
      gateUrl.pathname = ROUTES.adminGate;
      gateUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(gateUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

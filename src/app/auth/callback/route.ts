import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import {
  claimPurchaseByCheckoutSessionId,
  claimUnclaimedPurchasesForEmail,
} from "@/lib/auth/claim-purchase";
import { ROUTES } from "@/lib/constants";
import { createSupabaseRouteHandlerClient } from "@/lib/supabase/server";

function resolveSafeRedirectPath(next: string | null, isRecovery: boolean): string {
  if (isRecovery) {
    return ROUTES.loginResetPassword;
  }

  if (next?.startsWith("/")) {
    return next;
  }

  return ROUTES.dashboard;
}

function isRecoveryFlow(params: {
  type: EmailOtpType | null;
  next: string | null;
  recoverySentAt: string | undefined;
}): boolean {
  if (params.type === "recovery") {
    return true;
  }

  if (params.next === ROUTES.loginResetPassword) {
    return true;
  }

  if (params.recoverySentAt) {
    const sentAt = Date.parse(params.recoverySentAt);
    if (!Number.isNaN(sentAt) && Date.now() - sentAt < 60 * 60 * 1000) {
      return true;
    }
  }

  return false;
}

function redirectWithAuthCookies(
  origin: string,
  path: string,
  authResponse: NextResponse
): NextResponse {
  const redirectResponse = NextResponse.redirect(`${origin}${path}`);
  authResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");
  const sessionId = searchParams.get("session_id");

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_failed`);
  }

  const authResponse = NextResponse.next();
  const supabase = await createSupabaseRouteHandlerClient(authResponse);

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("[auth/callback] OTP verification failed:", error.message);
      return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_failed`);
    }
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/callback] Session exchange failed:", error.message);
      return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_failed`);
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isRecovery = isRecoveryFlow({
    type,
    next,
    recoverySentAt: user?.recovery_sent_at,
  });

  if (isRecovery) {
    return redirectWithAuthCookies(origin, ROUTES.loginResetPassword, authResponse);
  }

  let claimWarning: string | null = null;

  if (user?.email) {
    try {
      if (sessionId) {
        const result = await claimPurchaseByCheckoutSessionId(
          user.id,
          user.email,
          sessionId
        );
        if (!result.claimed) {
          claimWarning = result.reason ?? "claim_failed";
        }
      } else {
        await claimUnclaimedPurchasesForEmail(user.id, user.email);
      }
    } catch (claimError) {
      console.error("[auth/callback] Purchase claim failed:", claimError);
      claimWarning = "claim_failed";
    }
  }

  if (claimWarning) {
    return redirectWithAuthCookies(
      origin,
      `${ROUTES.accessDenied}?reason=${encodeURIComponent(claimWarning)}`,
      authResponse
    );
  }

  return redirectWithAuthCookies(
    origin,
    resolveSafeRedirectPath(next, false),
    authResponse
  );
}

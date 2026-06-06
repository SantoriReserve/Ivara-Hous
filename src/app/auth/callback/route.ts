import { NextResponse } from "next/server";
import {
  claimPurchaseByCheckoutSessionId,
  claimUnclaimedPurchasesForEmail,
} from "@/lib/auth/claim-purchase";
import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? ROUTES.dashboard;
  const sessionId = searchParams.get("session_id");

  if (!code) {
    return NextResponse.redirect(`${origin}${ROUTES.login}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] Session exchange failed:", error);
    return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email) {
    try {
      if (sessionId) {
        await claimPurchaseByCheckoutSessionId(user.id, user.email, sessionId);
      } else {
        await claimUnclaimedPurchasesForEmail(user.id, user.email);
      }
    } catch (claimError) {
      console.error("[auth/callback] Purchase claim failed:", claimError);
    }
  }

  const redirectPath = next.startsWith("/") ? next : ROUTES.dashboard;
  return NextResponse.redirect(`${origin}${redirectPath}`);
}

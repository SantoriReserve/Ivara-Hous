import { NextResponse } from "next/server";
import { ROUTES } from "@/lib/constants";
import { getSiteUrl } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type RedirectStep = {
  step: number;
  url: string;
  status: number;
  location: string | null;
};

function unauthorized() {
  return NextResponse.json({ pass: false, detail: "Unauthorized" }, { status: 401 });
}

function parseRedirectToFromActionLink(actionLink: string): string | null {
  try {
    const url = new URL(actionLink);
    return url.searchParams.get("redirect_to");
  } catch {
    return null;
  }
}

async function followRedirectChain(startUrl: string, maxSteps = 10): Promise<RedirectStep[]> {
  const chain: RedirectStep[] = [];
  let current = startUrl;

  for (let step = 0; step < maxSteps; step += 1) {
    const response = await fetch(current, { redirect: "manual" });
    const location = response.headers.get("location");
    chain.push({
      step,
      url: current,
      status: response.status,
      location,
    });

    if (!location || response.status < 300 || response.status >= 400) {
      break;
    }

    current = location.startsWith("http") ? location : new URL(location, current).toString();
  }

  return chain;
}

export async function GET(request: Request) {
  const secret = process.env.VERIFY_E2E_SECRET;
  if (!secret) {
    return NextResponse.json(
      { pass: false, detail: "VERIFY_E2E_SECRET not configured" },
      { status: 500 }
    );
  }

  const provided = request.headers.get("x-verify-secret");
  if (provided !== secret) {
    return unauthorized();
  }

  const requestUrl = new URL(request.url);
  const followRedirects = requestUrl.searchParams.get("follow") !== "false";

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const appRedirectTo = `${siteUrl}${ROUTES.authCallback}?next=${encodeURIComponent(ROUTES.loginResetPassword)}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;

  const testEmail = `forensic-${Date.now()}@owner-live.ivarahous.com`;
  const testPassword = `Forensic-${Date.now()}!`;
  const admin = getSupabaseAdmin();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return NextResponse.json(
      { pass: false, detail: createError?.message ?? "Failed to create forensic test user" },
      { status: 500 }
    );
  }

  try {
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: testEmail,
      options: { redirectTo: appRedirectTo },
    });

    if (linkError || !linkData.properties?.action_link) {
      return NextResponse.json(
        { pass: false, detail: linkError?.message ?? "generateLink returned no action_link" },
        { status: 500 }
      );
    }

    const actionLink = linkData.properties.action_link;
    const redirectToInActionLink = parseRedirectToFromActionLink(actionLink);
    const redirectChain = followRedirects ? await followRedirectChain(actionLink) : [];
    const finalStep = redirectChain[redirectChain.length - 1];
    const finalUrl = finalStep?.location
      ? finalStep.location.startsWith("http")
        ? finalStep.location
        : new URL(finalStep.location, finalStep.url).toString()
      : finalStep?.url ?? actionLink;

    const decodedRedirectTo = redirectToInActionLink
      ? decodeURIComponent(redirectToInActionLink)
      : null;
    const redirectToPreserved =
      decodedRedirectTo !== null &&
      (decodedRedirectTo === appRedirectTo ||
        decodedRedirectTo === decodeURIComponent(appRedirectTo));

    const finalUrlObj = (() => {
      try {
        return new URL(finalUrl);
      } catch {
        return null;
      }
    })();

    return NextResponse.json({
      pass: true,
      forensic: {
        supabaseProjectUrl: supabaseUrl,
        configuredSiteUrl: siteUrl,
        appRedirectToSentToSupabase: appRedirectTo,
        appRedirectToUsesWwwDomain: appRedirectTo.startsWith("https://www.ivarahous.com"),
        appRedirectToUsesVercelDomain: appRedirectTo.includes("ivara-hous.vercel.app"),
        emailButtonUrl: actionLink,
        redirectToEmbeddedInEmailLink: redirectToInActionLink,
        redirectToPreservedInEmailLink: redirectToPreserved,
        redirectToMatchesCallbackWithNext:
          redirectToInActionLink !== null &&
          decodeURIComponent(redirectToInActionLink).includes("/auth/callback") &&
          decodeURIComponent(redirectToInActionLink).includes("next=") &&
          decodeURIComponent(redirectToInActionLink).includes("/login/reset-password"),
        emailLinkUsesSupabaseVerifyEndpoint: actionLink.includes("/auth/v1/verify"),
        usesConfirmationUrlPattern: actionLink.includes("redirect_to="),
        redirectChain,
        redirectChainSummary: redirectChain.map((s) => ({
          step: s.step,
          url: s.url,
          status: s.status,
          location: s.location,
        })),
        firstUrl: redirectChain[0]?.url ?? actionLink,
        secondUrl: redirectChain[1]?.url ?? redirectChain[1]?.location ?? null,
        finalUrl,
        finalPathname: finalUrlObj?.pathname ?? null,
        finalHasCode: finalUrlObj?.searchParams.has("code") ?? false,
        finalHasTokenHash: finalUrlObj?.searchParams.has("token_hash") ?? false,
        finalHasRecoveryType: finalUrlObj?.searchParams.get("type") === "recovery",
        finalHasNextResetPassword:
          finalUrlObj?.searchParams.get("next") === ROUTES.loginResetPassword,
        landsOnHomepage:
          finalUrlObj?.origin === siteUrl &&
          (finalUrlObj?.pathname === "/" || finalUrlObj?.pathname === "") &&
          !finalUrlObj?.searchParams.has("code") &&
          !finalUrlObj?.searchParams.has("token_hash"),
        hashedTokenAvailable: Boolean(linkData.properties.hashed_token),
        verificationType: linkData.properties.verification_type ?? null,
        e2eTestEmail: followRedirects ? null : testEmail,
        e2eTestPassword: followRedirects ? null : testPassword,
      },
      notes: [
        "emailButtonUrl is the Supabase action_link (same structure as {{ .ConfirmationURL }} in the default template).",
        "Supabase Dashboard URL Configuration (Site URL / Redirect URLs) cannot be read from this API.",
        "If redirectToPreservedInEmailLink is false, redirect_to was not embedded in the generated link.",
        "If landsOnHomepage is true, Supabase verify redirected to Site URL without auth params.",
      ],
    });
  } finally {
    if (followRedirects) {
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }
}

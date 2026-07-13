import { NextResponse } from "next/server";
import {
  ADMIN_PIN_COOKIE,
  createPinSessionToken,
} from "@/lib/admin/admin-pin-auth";
import { getSiteUrl } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ROUTES_TO_CHECK = [
  "/admin",
  "/admin/customers",
  "/admin/revenue",
  "/admin/conversion",
  "/admin/analytics",
  "/admin/emails",
  "/admin/assessments",
  "/admin/plans",
  "/admin/activity",
  "/admin/creator-crm",
  "/admin/partner-crm",
  "/admin/contact-inquiries",
] as const;

function extractException(html: string): {
  hasCrash: boolean;
  digest: string | null;
  message: string | null;
  headline: string | null;
} {
  const hasCrash =
    html.includes("Something went wrong") ||
    html.includes("Application error") ||
    html.includes("Digest:");
  const digest = html.match(/Digest:\s*([0-9]+)/)?.[1] ?? null;
  const message =
    html.match(/Exception<\/p>\s*<p[^>]*>\s*([^<]+)/)?.[1]?.trim() ??
    html.match(/(TypeError|ReferenceError|RangeError|Error):\s*([^<\n]+)/)?.[0] ??
    null;
  const headline = html.match(/<h1[^>]*>([^<]+)/)?.[1] ?? null;
  return { hasCrash, digest, message, headline };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if ((searchParams.get("code") ?? "") !== (process.env.ADMIN_ACCESS_CODE ?? "4488")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const token = await createPinSessionToken();
  const cookie = `${ADMIN_PIN_COOKIE}=${token}`;

  const results = [];
  for (const route of ROUTES_TO_CHECK) {
    const started = Date.now();
    try {
      const response = await fetch(`${siteUrl}${route}`, {
        headers: {
          Cookie: cookie,
          Accept: "text/html",
        },
        redirect: "manual",
        cache: "no-store",
      });
      const html = await response.text();
      const extracted = extractException(html);
      results.push({
        route,
        status: response.status,
        ms: Date.now() - started,
        ok: response.status === 200 && !extracted.hasCrash,
        location: response.headers.get("location"),
        ...extracted,
      });
    } catch (error) {
      results.push({
        route,
        status: 0,
        ms: Date.now() - started,
        ok: false,
        hasCrash: true,
        digest: null,
        message: error instanceof Error ? error.message : String(error),
        headline: null,
        location: null,
      });
    }
  }

  const failed = results.filter((row) => !row.ok);
  return NextResponse.json({
    ok: failed.length === 0,
    siteUrl,
    failedCount: failed.length,
    failed,
    results,
  });
}

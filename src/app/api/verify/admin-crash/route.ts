import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getAdminActivityMetrics,
  getAdminAssessments,
  getAdminConversionMetrics,
  getAdminCustomers,
  getAdminEmailDeliveries,
  getAdminEmailStats,
  getAdminNotifications,
  getAdminOverviewMetrics,
  getAdminPlanAnalytics,
  getAdminRevenueMetrics,
  getAdminTrendAnalytics,
} from "@/lib/admin/admin-repository";
import { getAdminContactInquiries, getAdminCreatorApplications, getAdminPartnerInquiries } from "@/lib/admin/crm-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProbeResult = {
  name: string;
  ok: boolean;
  ms: number;
  error?: string;
  stack?: string;
  detail?: string;
};

async function probe(name: string, fn: () => Promise<unknown>): Promise<ProbeResult> {
  const started = Date.now();
  try {
    await fn();
    return { name, ok: true, ms: Date.now() - started };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      name,
      ok: false,
      ms: Date.now() - started,
      error: err.message,
      stack: err.stack,
    };
  }
}

async function probeQuery(
  name: string,
  fn: () => PromiseLike<{ error: { message: string; code?: string; details?: string; hint?: string } | null }>
): Promise<ProbeResult> {
  const started = Date.now();
  try {
    const { error } = await fn();
    if (error) {
      return {
        name,
        ok: false,
        ms: Date.now() - started,
        error: error.message,
        detail: [error.code, error.details, error.hint].filter(Boolean).join(" | "),
      };
    }
    return { name, ok: true, ms: Date.now() - started };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return {
      name,
      ok: false,
      ms: Date.now() - started,
      error: err.message,
      stack: err.stack,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = process.env.VERIFY_E2E_SECRET;
  const provided = searchParams.get("secret") ?? "";

  // Allow pin-code fallback so we can diagnose without storing VERIFY_E2E_SECRET locally.
  const code = searchParams.get("code") ?? "";
  const pinOk = code === (process.env.ADMIN_ACCESS_CODE ?? "4488");
  const secretOk = Boolean(secret) && provided === secret;

  if (!pinOk && !secretOk) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const env = {
    hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
  };

  let adminClientOk = true;
  let adminClientError: string | undefined;
  try {
    getSupabaseAdmin();
  } catch (error) {
    adminClientOk = false;
    adminClientError = error instanceof Error ? error.message : String(error);
  }

  const supabase = adminClientOk ? getSupabaseAdmin() : null;

  const sqlProbes: ProbeResult[] = [];
  if (supabase) {
    sqlProbes.push(
      await probeQuery("sql:purchases+product_slug", () =>
        supabase
          .from("purchases")
          .select("id, product_slug, customer_email")
          .eq("status", "completed")
          .limit(1)
      ),
      await probeQuery("sql:plan_instances", () =>
        supabase.from("plan_instances").select("id, status, plan_summary").limit(1)
      ),
      await probeQuery("sql:assessments", () =>
        supabase.from("assessments").select("id, analysis").limit(1)
      ),
      await probeQuery("sql:email_deliveries", () =>
        supabase.from("email_deliveries").select("id").limit(1)
      ),
      await probeQuery("sql:admin_customer_notes", () =>
        supabase.from("admin_customer_notes").select("id").limit(1)
      ),
      await probeQuery("sql:admin_customer_tags", () =>
        supabase.from("admin_customer_tags").select("id").limit(1)
      ),
      await probeQuery("sql:creator_applications", () =>
        supabase.from("creator_applications").select("id").limit(1)
      ),
      await probeQuery("sql:partner_inquiries", () =>
        supabase.from("partner_inquiries").select("id").limit(1)
      ),
      await probeQuery("sql:contact_inquiries", () =>
        supabase.from("contact_inquiries").select("id").limit(1)
      ),
      await probeQuery("sql:content_idea_progress", () =>
        supabase.from("content_idea_progress").select("planned").limit(1)
      ),
      await probeQuery("sql:learning_insight_responses", () =>
        supabase.from("learning_insight_responses").select("id").limit(1)
      ),
      await probeQuery("sql:plan_task_completions.join", () =>
        supabase
          .from("plan_task_completions")
          .select("id, plan_day_tasks(title, is_required)")
          .limit(1)
      )
    );

    try {
      const started = Date.now();
      const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      sqlProbes.push({
        name: "sql:auth.admin.listUsers",
        ok: !error,
        ms: Date.now() - started,
        error: error?.message,
        detail: data ? `users=${data.users.length}` : undefined,
      });
    } catch (error) {
      sqlProbes.push({
        name: "sql:auth.admin.listUsers",
        ok: false,
        ms: 0,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  const loaderProbes = await Promise.all([
    probe("loader:getAdminOverviewMetrics", () => getAdminOverviewMetrics()),
    probe("loader:getAdminNotifications", () => getAdminNotifications()),
    probe("loader:getAdminCustomers", () => getAdminCustomers()),
    probe("loader:getAdminRevenueMetrics", () => getAdminRevenueMetrics()),
    probe("loader:getAdminConversionMetrics", () => getAdminConversionMetrics()),
    probe("loader:getAdminTrendAnalytics", () => getAdminTrendAnalytics()),
    probe("loader:getAdminAssessments", () => getAdminAssessments()),
    probe("loader:getAdminPlanAnalytics", () => getAdminPlanAnalytics()),
    probe("loader:getAdminActivityMetrics", () => getAdminActivityMetrics()),
    probe("loader:getAdminEmailDeliveries", () => getAdminEmailDeliveries()),
    probe("loader:getAdminEmailStats", () => getAdminEmailStats()),
    probe("loader:getAdminCreatorApplications", () => getAdminCreatorApplications()),
    probe("loader:getAdminPartnerInquiries", () => getAdminPartnerInquiries()),
    probe("loader:getAdminContactInquiries", () => getAdminContactInquiries()),
  ]);

  // Unwrapped purchase query that mirrors overview critical path without soft fallback.
  let rawOverviewError: ProbeResult | null = null;
  if (supabase) {
    const started = Date.now();
    try {
      const [purchases, plans, assessments, authUsers] = await Promise.all([
        supabase
          .from("purchases")
          .select(
            "id, user_id, assessment_id, customer_email, amount_cents, currency, status, purchased_at, product_slug"
          )
          .eq("status", "completed"),
        supabase.from("plan_instances").select(
          "id, user_id, purchase_id, assessment_id, status, current_focus_day, completion_percentage, completed_required_tasks, total_required_tasks, completed_at, updated_at, plan_summary"
        ),
        supabase.from("assessments").select("id, email, full_name"),
        supabase.auth.admin.listUsers({ page: 1, perPage: 200 }),
      ]);

      const failures = [
        purchases.error && `purchases: ${purchases.error.message}`,
        plans.error && `plan_instances: ${plans.error.message}`,
        assessments.error && `assessments: ${assessments.error.message}`,
        authUsers.error && `auth.listUsers: ${authUsers.error.message}`,
      ].filter(Boolean);

      rawOverviewError = {
        name: "raw:overview-parallel",
        ok: failures.length === 0,
        ms: Date.now() - started,
        error: failures.length ? failures.join("; ") : undefined,
        detail: `purchases=${purchases.data?.length ?? 0}, plans=${plans.data?.length ?? 0}, assessments=${assessments.data?.length ?? 0}, users=${authUsers.data?.users.length ?? 0}`,
      };
    } catch (error) {
      rawOverviewError = {
        name: "raw:overview-parallel",
        ok: false,
        ms: Date.now() - started,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      };
    }
  }

  const results = [...sqlProbes, ...loaderProbes, ...(rawOverviewError ? [rawOverviewError] : [])];
  const failed = results.filter((row) => !row.ok);

  return NextResponse.json({
    ok: failed.length === 0 && adminClientOk,
    env,
    adminClientOk,
    adminClientError,
    failedCount: failed.length,
    failed,
    results,
  });
}

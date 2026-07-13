import type { AssessmentRecord } from "@/lib/assessment-schema";
import { listEmailDeliveries } from "@/lib/email/email-delivery-repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildTestPurchaseIdSet,
  buildTestUserIdSet,
  filterAssessments,
  filterByUserId,
  filterEmailRecipient,
  filterPlans,
  filterPurchases,
} from "@/lib/admin/admin-data-scope";
import type { AdminDataScope } from "@/lib/admin/admin-test-data";
import { isAutomatedTestEmail } from "@/lib/admin/admin-test-data";
import {
  resolveCustomerHealth,
  resolveCustomerSource,
  resolveLifecycleStatus,
  daysSince,
} from "@/lib/admin/customer-health";
import { getAdminProduct } from "@/lib/admin/admin-products";
import { getTagsByCustomerKeys, listCustomerNotes, listCustomerTags } from "@/lib/admin/customer-crm-repository";
import {
  buildAssessmentInsights,
  enrichCustomerJourney,
  resolveNextRecommendedAction,
} from "@/lib/admin/customer-insights";
import type {
  AdminActivityMetrics,
  AdminActivityTimelineEvent,
  AdminAssessmentRow,
  AdminConversionMetrics,
  AdminCustomerDetail,
  AdminCustomerFilter,
  AdminCustomerPurchaseSummary,
  AdminCustomerRow,
  AdminDistributionBucket,
  AdminNotificationItem,
  AdminOverviewMetrics,
  AdminPlanAnalytics,
  AdminQueryOptions,
  AdminRevenueMetrics,
  AdminTimeSeriesPoint,
  AdminTrendAnalytics,
} from "@/lib/admin/admin-types";
import type { EmailDeliveryRecord } from "@/lib/email/email-delivery-repository";
import {
  EMPTY_ACTIVITY_METRICS,
  EMPTY_CONVERSION_METRICS,
  EMPTY_OVERVIEW_METRICS,
  EMPTY_PLAN_ANALYTICS,
  EMPTY_REVENUE_METRICS,
  EMPTY_TREND_ANALYTICS,
  safeEmail,
  withAdminFallback,
} from "@/lib/admin/safe-admin";

type PurchaseRow = {
  id: string;
  user_id: string | null;
  assessment_id: string | null;
  customer_email: string;
  amount_cents: number;
  currency: string;
  status: string;
  purchased_at: string;
  product_slug?: string;
};

type PlanRow = {
  id: string;
  user_id: string;
  purchase_id: string;
  assessment_id: string;
  status: string;
  current_focus_day: number;
  completion_percentage: number;
  completed_required_tasks: number;
  total_required_tasks: number;
  completed_at: string | null;
  updated_at: string;
  plan_summary: { title?: string } | null;
};

type AssessmentRow = {
  id: string;
  email: string;
  full_name: string;
  schema_version: string;
  source: AssessmentRecord["source"];
  answers: AssessmentRecord["answers"];
  analysis: AssessmentRecord["analysis"];
  payment_status: AssessmentRecord["paymentStatus"];
  submitted_at: string;
  user_id: string | null;
};

function mapAssessmentRow(row: AssessmentRow): AssessmentRecord {
  return {
    assessmentId: row.id,
    submittedAt: row.submitted_at,
    schemaVersion: row.schema_version as AssessmentRecord["schemaVersion"],
    answers: row.answers,
    source: row.source,
    analysis: row.analysis,
    paymentStatus: row.payment_status,
  };
}

function averageAssessmentScore(analysis: AssessmentRecord["analysis"] | null | undefined): number | null {
  if (!analysis?.scores) {
    return null;
  }
  const values = Object.values(analysis.scores).filter((value) => typeof value === "number");
  if (!values.length) {
    return null;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function latestTimestamp(...values: Array<string | null | undefined>): string | null {
  let latest: string | null = null;
  let latestMs = -1;
  for (const value of values) {
    if (!value) continue;
    const ms = new Date(value).getTime();
    if (!Number.isNaN(ms) && ms > latestMs) {
      latestMs = ms;
      latest = value;
    }
  }
  return latest;
}

export function buildCustomerKey(userId: string | null, purchaseId: string): string {
  return userId ?? `purchase:${purchaseId}`;
}

export function parseCustomerKey(key: string): { userId: string | null; purchaseId: string | null } {
  if (key.startsWith("purchase:")) {
    return { userId: null, purchaseId: key.slice("purchase:".length) };
  }
  return { userId: key, purchaseId: null };
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return startOfDay(date);
}

function toDateKey(value: string): string {
  return startOfDay(new Date(value)).toISOString().slice(0, 10);
}

function toMonthKey(value: string): string {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toScope(options?: AdminQueryOptions): AdminDataScope {
  return { includeTestData: options?.includeTestData ?? false };
}

function countUniqueCustomersSince(purchases: PurchaseRow[], since: Date): number {
  const emails = new Set<string>();
  for (const row of purchases) {
    if (new Date(row.purchased_at) >= since) {
      const email = safeEmail(row.customer_email);
      if (email) emails.add(email);
    }
  }
  return emails.size;
}

function buildDailySeries(
  rows: Array<{ date: string; amount?: number; count?: number }>,
  days: number,
  valueKey: "amount" | "count"
): AdminTimeSeriesPoint[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = toDateKey(row.date);
    map.set(key, (map.get(key) ?? 0) + (row[valueKey] ?? 0));
  }

  const series: AdminTimeSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = daysAgo(i);
    const key = date.toISOString().slice(0, 10);
    series.push({ date: key, value: map.get(key) ?? 0 });
  }
  return series;
}

async function getAuthUserMeta(): Promise<
  Map<string, { lastLogin: string | null; createdAt: string | null; email: string | null }>
> {
  const supabase = getSupabaseAdmin();
  const map = new Map<
    string,
    { lastLogin: string | null; createdAt: string | null; email: string | null }
  >();
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[admin] Failed to list auth users:", error.message);
      break;
    }

    for (const user of data.users) {
      map.set(user.id, {
        lastLogin: user.last_sign_in_at ?? null,
        createdAt: user.created_at ?? null,
        email: user.email ?? null,
      });
    }

    if (data.users.length < perPage) {
      break;
    }
    page += 1;
  }

  return map;
}

async function selectPurchases(
  build: (columns: string) => PromiseLike<{ data: unknown; error: { message: string } | null }>
): Promise<PurchaseRow[]> {
  const withSlug =
    "id, user_id, assessment_id, customer_email, amount_cents, purchased_at, status, product_slug";
  const withoutSlug =
    "id, user_id, assessment_id, customer_email, amount_cents, purchased_at, status";

  const primary = await build(withSlug);
  if (!primary.error) {
    return ((primary.data ?? []) as PurchaseRow[]).filter((row) =>
      Boolean(safeEmail(row.customer_email))
    );
  }

  console.error("[admin] purchase select with product_slug failed:", primary.error.message);
  const fallback = await build(withoutSlug);
  if (fallback.error) {
    console.error("[admin] purchase select failed:", fallback.error.message);
    return [];
  }
  return ((fallback.data ?? []) as PurchaseRow[]).filter((row) =>
    Boolean(safeEmail(row.customer_email))
  );
}

async function selectPurchaseMaybe(
  build: (columns: string) => PromiseLike<{ data: unknown; error: { message: string } | null }>
): Promise<PurchaseRow | null> {
  const rows = await selectPurchases(async (columns) => {
    const result = await build(columns);
    return {
      data: result.data ? [result.data] : [],
      error: result.error,
    };
  });
  return rows[0] ?? null;
}

async function getCompletedPurchases(): Promise<PurchaseRow[]> {
  const supabase = getSupabaseAdmin();
  const primary = await supabase
    .from("purchases")
    .select(
      "id, user_id, assessment_id, customer_email, amount_cents, currency, status, purchased_at, product_slug"
    )
    .eq("status", "completed")
    .order("purchased_at", { ascending: false });

  if (!primary.error) {
    return ((primary.data ?? []) as PurchaseRow[]).filter((row) =>
      Boolean(safeEmail(row.customer_email))
    );
  }

  console.error("[admin] Failed to load purchases with product_slug:", primary.error.message);

  // Fallback for older schemas missing product_slug
  const fallback = await supabase
    .from("purchases")
    .select(
      "id, user_id, assessment_id, customer_email, amount_cents, currency, status, purchased_at"
    )
    .eq("status", "completed")
    .order("purchased_at", { ascending: false });

  if (fallback.error) {
    console.error("[admin] Failed to load purchases:", fallback.error.message);
    return [];
  }

  return ((fallback.data ?? []) as PurchaseRow[]).filter((row) =>
    Boolean(safeEmail(row.customer_email))
  );
}

async function getPlanInstances(): Promise<PlanRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .select(
      "id, user_id, purchase_id, assessment_id, status, current_focus_day, completion_percentage, completed_required_tasks, total_required_tasks, completed_at, updated_at, plan_summary"
    );

  if (error) {
    console.error("[admin] Failed to load plan instances:", error.message);
    return [];
  }

  return (data ?? []) as PlanRow[];
}

async function getProfilesMap(): Promise<Map<string, { fullName: string; email: string }>> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("profiles").select("id, full_name, email");
  const map = new Map<string, { fullName: string; email: string }>();
  for (const row of data ?? []) {
    map.set(row.id, {
      fullName: row.full_name ?? "",
      email: row.email ?? "",
    });
  }
  return map;
}

async function getLatestEmailStatusByPurchase(
  purchaseIds: string[]
): Promise<Map<string, string>> {
  if (!purchaseIds.length) {
    return new Map();
  }

  const deliveries = await listEmailDeliveries({ limit: 5000 });
  const map = new Map<string, string>();

  for (const delivery of deliveries) {
    if (!delivery.purchaseId || map.has(delivery.purchaseId)) {
      continue;
    }
    map.set(delivery.purchaseId, delivery.status);
  }

  return map;
}

function matchesCustomerFilter(
  filter: AdminCustomerFilter,
  row: Pick<
    AdminCustomerRow,
    "lifecycleStatus" | "health" | "source" | "planStatus" | "progressPercent"
  >
): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "active") {
    return row.lifecycleStatus === "active";
  }
  if (filter === "plan_active") {
    return row.planStatus === "active";
  }
  if (filter === "completed") {
    return row.lifecycleStatus === "completed";
  }
  if (filter === "inactive") {
    return row.lifecycleStatus === "inactive";
  }
  if (filter === "refunded") {
    return row.lifecycleStatus === "refunded";
  }
  if (filter === "failed") {
    return row.planStatus === "failed";
  }
  if (filter === "not_started") {
    return row.planStatus === "generating" || row.planStatus == null;
  }
  if (filter === "high_engagement") {
    return (row.progressPercent ?? 0) >= 50;
  }
  if (filter === "low_engagement") {
    return (row.progressPercent ?? 0) < 20;
  }
  if (filter === "on_track") {
    return row.health === "on_track";
  }
  if (filter === "needs_attention") {
    return row.health === "needs_attention";
  }
  if (filter === "at_risk") {
    return row.health === "at_risk";
  }
  if (filter === "free_assessment") {
    return row.source === "free_assessment";
  }
  if (filter === "direct_purchase") {
    return row.source === "direct_purchase";
  }
  return true;
}

export async function getAdminOverviewMetrics(
  options?: AdminQueryOptions
): Promise<AdminOverviewMetrics> {
  return withAdminFallback("getAdminOverviewMetrics", EMPTY_OVERVIEW_METRICS, () => load_getAdminOverviewMetrics(options));
}

async function load_getAdminOverviewMetrics(
  options?: AdminQueryOptions
): Promise<AdminOverviewMetrics> {
  const supabase = getSupabaseAdmin();
  const scope = toScope(options);
  const [allPurchases, allPlans, assessmentsRes, authUsers] = await Promise.all([
    getCompletedPurchases(),
    getPlanInstances(),
    supabase.from("assessments").select("id, email, full_name"),
    getAuthUserMeta(),
  ]);

  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const purchases = filterPurchases(allPurchases, scope);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);
  const assessments = filterAssessments((assessmentsRes.data ?? []) as AssessmentRow[], scope);

  const totalRevenueCents = purchases.reduce((sum, row) => sum + row.amount_cents, 0);
  const customerEmails = new Set(purchases.map((row) => safeEmail(row.customer_email)).filter(Boolean));
  const totalAssessments = assessments.length;
  const paidAssessments = purchases.filter((row) => row.assessment_id).length;
  const assessmentToPurchaseRate =
    totalAssessments > 0 ? (paidAssessments / totalAssessments) * 100 : 0;

  const activePlans = plans.filter((plan) => plan.status === "active").length;
  const completedPlans = plans.filter((plan) => plan.status === "completed").length;
  const failedPlans = plans.filter((plan) => plan.status === "failed").length;
  const averagePlanCompletion =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + plan.completion_percentage, 0) / plans.length
      : 0;
  const averageCurrentDay =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + plan.current_focus_day, 0) / plans.length
      : 0;

  const cutoff7 = daysAgo(7);
  const cutoff30 = daysAgo(30);
  const newCustomers7Days = countUniqueCustomersSince(purchases, cutoff7);
  const newCustomers30Days = countUniqueCustomersSince(purchases, cutoff30);

  const revenueOverTime = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, amount: row.amount_cents })),
    30,
    "amount"
  );
  const purchasesOverTime = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, count: 1 })),
    30,
    "count"
  );

  const newUsersOverTime = buildDailySeries(
    [...authUsers.entries()]
      .filter(([userId, meta]) => {
        if (scope.includeTestData) {
          return true;
        }
        return !testUserIds.has(userId) && !isAutomatedTestEmail(meta.email);
      })
      .map(([, meta]) => ({
        date: meta.createdAt ?? new Date().toISOString(),
        count: 1,
      })),
    30,
    "count"
  );

  const buckets: AdminDistributionBucket[] = [
    { label: "0–20%", count: 0 },
    { label: "21–40%", count: 0 },
    { label: "41–60%", count: 0 },
    { label: "61–80%", count: 0 },
    { label: "81–100%", count: 0 },
  ];

  for (const plan of plans) {
    const pct = plan.completion_percentage;
    if (pct <= 20) buckets[0].count += 1;
    else if (pct <= 40) buckets[1].count += 1;
    else if (pct <= 60) buckets[2].count += 1;
    else if (pct <= 80) buckets[3].count += 1;
    else buckets[4].count += 1;
  }

  return {
    totalRevenueCents,
    totalCustomers: customerEmails.size,
    totalPurchases: purchases.length,
    totalAssessments,
    assessmentToPurchaseRate,
    activePlans,
    completedPlans,
    failedPlans,
    averagePlanCompletion,
    averageCurrentDay,
    newCustomers7Days,
    newCustomers30Days,
    revenueOverTime,
    purchasesOverTime,
    newUsersOverTime,
    planCompletionDistribution: buckets,
  };
}

export async function getAdminCustomers(params?: {
  query?: string;
  filter?: AdminCustomerFilter;
  tag?: string;
  includeTestData?: boolean;
}): Promise<AdminCustomerRow[]> {
  return withAdminFallback("getAdminCustomers", [], () => load_getAdminCustomers(params));
}

async function load_getAdminCustomers(params?: {
  query?: string;
  filter?: AdminCustomerFilter;
  tag?: string;
  includeTestData?: boolean;
}): Promise<AdminCustomerRow[]> {
  const query = params?.query?.trim().toLowerCase() ?? "";
  const filter = params?.filter ?? "all";
  const tagFilter = params?.tag?.trim().toLowerCase() ?? "";
  const scope = toScope({ includeTestData: params?.includeTestData });

  const supabase = getSupabaseAdmin();
  const [allPurchases, allPlans, profiles, authUsers, assessmentsRes] = await Promise.all([
    getCompletedPurchases(),
    getPlanInstances(),
    getProfilesMap(),
    getAuthUserMeta(),
    supabase.from("assessments").select("id, email, full_name, analysis"),
  ]);

  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const purchases = filterPurchases(allPurchases, scope);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);
  const assessmentsById = new Map(
    ((assessmentsRes.data ?? []) as AssessmentRow[]).map((row) => [row.id, row])
  );

  const plansByPurchase = new Map(plans.map((plan) => [plan.purchase_id, plan]));
  const emailStatusMap = await getLatestEmailStatusByPurchase(purchases.map((row) => row.id));

  const purchasesByEmail = new Map<string, number>();
  for (const purchase of purchases) {
    const key = safeEmail(purchase.customer_email);
    purchasesByEmail.set(key, (purchasesByEmail.get(key) ?? 0) + 1);
  }

  const purchaseIndexByEmail = new Map<string, number>();
  const sortedPurchases = [...purchases].sort(
    (a, b) => new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
  );

  const draftRows = sortedPurchases.map((purchase) => {
    const plan = plansByPurchase.get(purchase.id);
    const profile = purchase.user_id ? profiles.get(purchase.user_id) : undefined;
    const auth = purchase.user_id ? authUsers.get(purchase.user_id) : undefined;
    const assessment = purchase.assessment_id
      ? assessmentsById.get(purchase.assessment_id)
      : undefined;
    const name =
      profile?.fullName?.trim() ||
      assessment?.full_name?.trim() ||
      purchase.customer_email.split("@")[0] ||
      "Customer";
    const emailKey = safeEmail(purchase.customer_email);
    const purchaseNumber = (purchaseIndexByEmail.get(emailKey) ?? 0) + 1;
    purchaseIndexByEmail.set(emailKey, purchaseNumber);
    const customerKey = buildCustomerKey(purchase.user_id, purchase.id);

    const lastActiveAt = latestTimestamp(auth?.lastLogin, plan?.updated_at, plan?.completed_at);
    const source = resolveCustomerSource(Boolean(purchase.assessment_id));
    const lifecycleStatus = resolveLifecycleStatus({
      purchaseStatus: purchase.status,
      planStatus: plan?.status,
      lastActiveAt,
    });
    const health = resolveCustomerHealth({
      lifecycleStatus,
      lastActiveAt,
      progressPercent: plan?.completion_percentage ?? null,
      purchaseDate: purchase.purchased_at,
    });
    const product = getAdminProduct(purchase.product_slug);

    return {
      customerKey,
      name,
      email: purchase.customer_email,
      purchaseDate: purchase.purchased_at,
      amountPaidCents: purchase.amount_cents,
      planStatus: plan?.status ?? null,
      progressPercent: plan?.completion_percentage ?? null,
      currentDay: plan?.current_focus_day ?? null,
      lastLogin: auth?.lastLogin ?? null,
      lastActiveAt,
      emailStatus: emailStatusMap.get(purchase.id) ?? "not_sent",
      userId: purchase.user_id,
      purchaseId: purchase.id,
      purchaseNumber,
      totalPurchasesForEmail: purchasesByEmail.get(emailKey) ?? 1,
      lifecycleStatus,
      health,
      assessmentScore: averageAssessmentScore(
        assessment?.analysis as AssessmentRecord["analysis"] | undefined
      ),
      source,
      tags: [] as string[],
      productSlug: product.slug,
    };
  });

  const tagsByKey = await getTagsByCustomerKeys(draftRows.map((row) => row.customerKey));
  const rows: AdminCustomerRow[] = draftRows.map((row) => ({
    ...row,
    tags: tagsByKey.get(row.customerKey) ?? [],
  }));

  return rows.filter((row) => {
    const matchesQuery =
      !query ||
      row.name.toLowerCase().includes(query) ||
      row.email.toLowerCase().includes(query) ||
      row.tags.some((tag) => tag.toLowerCase().includes(query));
    const matchesTag =
      !tagFilter || row.tags.some((tag) => tag.toLowerCase() === tagFilter);
    return matchesQuery && matchesTag && matchesCustomerFilter(filter, row);
  });
}

export async function getAdminCustomerDetail(
  customerKey: string,
  options?: AdminQueryOptions
): Promise<AdminCustomerDetail | null> {
  try {
    return await getAdminCustomerDetailUnsafe(customerKey, options);
  } catch (error) {
    console.error("[admin] getAdminCustomerDetail failed:", customerKey, error);
    return null;
  }
}

async function getAdminCustomerDetailUnsafe(
  customerKey: string,
  options?: AdminQueryOptions
): Promise<AdminCustomerDetail | null> {
  const { userId, purchaseId } = parseCustomerKey(customerKey);
  const scope = toScope(options);
  const supabase = getSupabaseAdmin();

  let purchase: PurchaseRow | null = null;
  let relatedPurchases: PurchaseRow[] = [];

  if (purchaseId) {
    purchase = await selectPurchaseMaybe((columns) =>
      supabase.from("purchases").select(columns).eq("id", purchaseId).maybeSingle()
    );
    if (purchase) {
      relatedPurchases = await selectPurchases((columns) =>
        supabase
          .from("purchases")
          .select(columns)
          .eq("customer_email", purchase!.customer_email)
          .eq("status", "completed")
          .order("purchased_at", { ascending: false })
      );
      relatedPurchases = filterPurchases(relatedPurchases, scope);
    }
  } else if (userId) {
    relatedPurchases = filterPurchases(
      await selectPurchases((columns) =>
        supabase
          .from("purchases")
          .select(columns)
          .eq("user_id", userId)
          .eq("status", "completed")
          .order("purchased_at", { ascending: false })
      ),
      scope
    );
    purchase = relatedPurchases[0] ?? null;
  }

  if (!purchase) {
    return null;
  }

  if (!scope.includeTestData && isAutomatedTestEmail(purchase.customer_email)) {
    return null;
  }

  const resolvedUserId = purchase.user_id ?? userId;
  const [profiles, authUsers, plans, assessmentsRes, contentRes, insightsRes, deliveries] =
    await Promise.all([
      getProfilesMap(),
      getAuthUserMeta(),
      getPlanInstances(),
      purchase.assessment_id
        ? supabase
            .from("assessments")
            .select("*")
            .eq("id", purchase.assessment_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      resolvedUserId
        ? supabase.from("content_idea_progress").select("planned, filmed, edited, posted").eq("user_id", resolvedUserId)
        : Promise.resolve({ data: [] }),
      resolvedUserId
        ? supabase
            .from("learning_insight_responses")
            .select("id, day_number, prompt, response, created_at")
            .eq("user_id", resolvedUserId)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] }),
      listEmailDeliveries({ limit: 500 }),
    ]);

  const plan = plans.find((row) => row.purchase_id === purchase.id);
  const profile = resolvedUserId ? profiles.get(resolvedUserId) : undefined;
  const auth = resolvedUserId ? authUsers.get(resolvedUserId) : undefined;
  const assessmentRow = assessmentsRes.data as AssessmentRow | null;
  const assessment = assessmentRow ? mapAssessmentRow(assessmentRow) : null;

  const contentRows = contentRes.data ?? [];
  const content = {
    planned: contentRows.filter((row) => row.planned).length,
    filmed: contentRows.filter((row) => row.filmed).length,
    edited: contentRows.filter((row) => row.edited).length,
    posted: contentRows.filter((row) => row.posted).length,
  };

  let lastDashboardActivity: string | null = null;
  let lastCompletedTask: string | null = null;
  let tasksSkipped = 0;
  let consecutiveDaysActive = 0;
  const completionEvents: AdminActivityTimelineEvent[] = [];

  if (resolvedUserId) {
    const { data: completions } = await supabase
      .from("plan_task_completions")
      .select("id, status, completed_at, updated_at, plan_day_task_id")
      .eq("user_id", resolvedUserId)
      .order("updated_at", { ascending: false })
      .limit(200);

    const rows = completions ?? [];
    const latest = rows[0];
    lastDashboardActivity = latest?.completed_at ?? latest?.updated_at ?? plan?.updated_at ?? null;
    tasksSkipped = rows.filter((row) => row.status === "skipped").length;

    const latestCompleted = rows.find((row) => row.status === "completed");
    if (latestCompleted?.plan_day_task_id) {
      const { data: taskRow } = await supabase
        .from("plan_day_tasks")
        .select("title, plan_day_id")
        .eq("id", latestCompleted.plan_day_task_id)
        .maybeSingle();
      if (taskRow) {
        let dayNumber: number | null = null;
        if (taskRow.plan_day_id) {
          const { data: dayRow } = await supabase
            .from("plan_days")
            .select("day_number")
            .eq("id", taskRow.plan_day_id)
            .maybeSingle();
          dayNumber = dayRow?.day_number ?? null;
        }
        lastCompletedTask =
          dayNumber != null ? `Day ${dayNumber}: ${taskRow.title}` : String(taskRow.title);
        completionEvents.push({
          id: `completion-named-${latestCompleted.id}`,
          occurredAt: latestCompleted.completed_at ?? latestCompleted.updated_at,
          label: `Completed ${taskRow.title}`,
          detail: dayNumber != null ? `Day ${dayNumber}` : undefined,
        });
      }
    }

    const dayKeys = new Set<string>();
    for (const row of rows) {
      const stamp = row.completed_at ?? row.updated_at;
      if (!stamp) continue;
      dayKeys.add(toDateKey(stamp));
      const dayLabel =
        row.status === "skipped" ? "Skipped Task" : "Completed Task";
      completionEvents.push({
        id: `completion-${row.id}`,
        occurredAt: stamp,
        label: dayLabel,
        detail: row.status === "completed" ? "Required plan task completed" : "Task marked skipped",
      });
    }

    const todayKey = toDateKey(new Date().toISOString());
    const cursor = new Date();
    for (let i = 0; i < 40; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      if (i === 0 && key !== todayKey && !dayKeys.has(key)) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      if (!dayKeys.has(key)) {
        break;
      }
      consecutiveDaysActive += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
  } else {
    lastDashboardActivity = plan?.updated_at ?? null;
  }

  const resolvedCustomerKey = buildCustomerKey(resolvedUserId, purchase.id);
  const [customerEmailsRaw, notes, tagRows] = await Promise.all([
    Promise.resolve(
      filterEmailRecipient(
        deliveries.filter(
          (delivery) =>
            delivery.purchaseId === purchase.id ||
            relatedPurchases.some((row) => row.id === delivery.purchaseId) ||
            (resolvedUserId && delivery.userId === resolvedUserId) ||
            delivery.recipientEmail.toLowerCase() === safeEmail(purchase.customer_email)
        ),
        scope
      )
    ),
    listCustomerNotes(resolvedCustomerKey),
    listCustomerTags(resolvedCustomerKey),
  ]);
  const customerEmails = customerEmailsRaw;

  const allPurchases: AdminCustomerPurchaseSummary[] = relatedPurchases.map((row) => {
    const relatedPlan = plans.find((planRow) => planRow.purchase_id === row.id);
    return {
      customerKey: buildCustomerKey(row.user_id, row.id),
      purchaseId: row.id,
      purchaseDate: row.purchased_at,
      amountPaidCents: row.amount_cents,
      planStatus: relatedPlan?.status ?? null,
      progressPercent: relatedPlan?.completion_percentage ?? null,
      paymentStatus: row.status,
    };
  });

  const lastActiveAt = latestTimestamp(auth?.lastLogin, lastDashboardActivity, plan?.updated_at);
  const source = resolveCustomerSource(Boolean(purchase.assessment_id));
  const lifecycleStatus = resolveLifecycleStatus({
    purchaseStatus: purchase.status,
    planStatus: plan?.status,
    lastActiveAt,
  });
  const health = resolveCustomerHealth({
    lifecycleStatus,
    lastActiveAt,
    progressPercent: plan?.completion_percentage ?? null,
    purchaseDate: purchase.purchased_at,
  });
  const assessmentInsights = buildAssessmentInsights(assessment);
  const nextRecommendedAction = resolveNextRecommendedAction({
    lifecycleStatus,
    health,
    currentDay: plan?.current_focus_day ?? null,
    progressPercent: plan?.completion_percentage ?? null,
    assessmentNextStep: assessmentInsights.nextAction,
    lastLogin: auth?.lastLogin ?? null,
  });
  const product = getAdminProduct(
    (purchase as PurchaseRow & { product_slug?: string }).product_slug
  );
  const totalRevenueCents = relatedPurchases.reduce((sum, row) => sum + row.amount_cents, 0);

  const timeline = enrichCustomerJourney({
    purchaseDate: purchase.purchased_at,
    assessment,
    emails: customerEmails,
    lastLogin: auth?.lastLogin ?? null,
    authCreatedAt: auth?.createdAt ?? null,
    currentDay: plan?.current_focus_day ?? null,
    planCompletedAt: plan?.completed_at ?? null,
    completionEvents,
    lastActiveAt,
  });

  return {
    customerKey: resolvedCustomerKey,
    name:
      profile?.fullName ||
      assessment?.answers?.fullName ||
      purchase.customer_email.split("@")[0] ||
      "Customer",
    email: purchase.customer_email,
    userId: resolvedUserId,
    purchaseId: purchase.id,
    productSlug: product.slug,
    joinDate: auth?.createdAt ?? purchase.purchased_at,
    purchaseDate: purchase.purchased_at,
    amountPaidCents: purchase.amount_cents,
    totalRevenueCents,
    planTitle: plan?.plan_summary?.title || product.name,
    planStatus: plan?.status ?? null,
    paymentStatus: purchase.status,
    progressPercent: plan?.completion_percentage ?? null,
    currentDay: plan?.current_focus_day ?? null,
    tasksCompleted: plan?.completed_required_tasks ?? 0,
    tasksRemaining: plan
      ? Math.max(plan.total_required_tasks - plan.completed_required_tasks, 0)
      : 0,
    tasksSkipped,
    consecutiveDaysActive,
    lastLogin: auth?.lastLogin ?? null,
    lastDashboardActivity,
    lastCompletedTask,
    lifecycleStatus,
    health,
    assessmentScore: assessmentInsights.overallScore,
    source,
    assessment,
    snapshot: {
      health,
      currentStage: assessmentInsights.currentStage,
      daysSincePurchase: daysSince(purchase.purchased_at),
      daysSinceLastLogin: daysSince(auth?.lastLogin),
      lifetimeValueCents: totalRevenueCents,
      currentDay: plan?.current_focus_day ?? null,
      completionPercent: plan?.completion_percentage ?? null,
      lastCompletedTask,
      nextRecommendedAction,
      productSlug: product.slug,
      productName: product.name,
    },
    assessmentInsights,
    notes: notes.map((note) => ({
      id: note.id,
      body: note.body,
      createdBy: note.createdBy,
      createdAt: note.createdAt,
    })),
    tags: tagRows.map((tag) => tag.tag),
    content,
    learningInsights: (insightsRes.data ?? []).map((row) => ({
      id: row.id,
      dayNumber: row.day_number,
      prompt: row.prompt,
      response: row.response,
      createdAt: row.created_at,
    })),
    emails: customerEmails,
    allPurchases,
    timeline: timeline.slice(0, 80),
  };
}

export async function getAdminRevenueMetrics(
  options?: AdminQueryOptions
): Promise<AdminRevenueMetrics> {
  return withAdminFallback("getAdminRevenueMetrics", EMPTY_REVENUE_METRICS, () => load_getAdminRevenueMetrics(options));
}

async function load_getAdminRevenueMetrics(
  options?: AdminQueryOptions
): Promise<AdminRevenueMetrics> {
  const scope = toScope(options);
  const allPurchases = await getCompletedPurchases();
  const purchases = filterPurchases(allPurchases, scope);
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = daysAgo(7);
  const monthAgo = daysAgo(30);

  const revenueTodayCents = purchases
    .filter((row) => new Date(row.purchased_at) >= today)
    .reduce((sum, row) => sum + row.amount_cents, 0);
  const revenueWeekCents = purchases
    .filter((row) => new Date(row.purchased_at) >= weekAgo)
    .reduce((sum, row) => sum + row.amount_cents, 0);
  const revenueMonthCents = purchases
    .filter((row) => new Date(row.purchased_at) >= monthAgo)
    .reduce((sum, row) => sum + row.amount_cents, 0);
  const revenueAllTimeCents = purchases.reduce((sum, row) => sum + row.amount_cents, 0);
  const averageOrderValueCents =
    purchases.length > 0 ? Math.round(revenueAllTimeCents / purchases.length) : 0;

  const dailyRevenue = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, amount: row.amount_cents })),
    30,
    "amount"
  );

  const monthlyMap = new Map<string, number>();
  for (const purchase of purchases) {
    const key = toMonthKey(purchase.purchased_at);
    monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + purchase.amount_cents);
  }
  const monthlyRevenue = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, value]) => ({ date, value }));

  const purchaseCountSeries = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, count: 1 })),
    30,
    "count"
  );

  return {
    revenueTodayCents,
    revenueWeekCents,
    revenueMonthCents,
    revenueAllTimeCents,
    averageOrderValueCents,
    refundsCents: 0,
    dailyRevenue,
    monthlyRevenue,
    purchaseCountSeries,
    totalPurchaseCount: purchases.length,
  };
}

export async function getAdminConversionMetrics(
  options?: AdminQueryOptions
): Promise<AdminConversionMetrics> {
  return withAdminFallback("getAdminConversionMetrics", EMPTY_CONVERSION_METRICS, () => load_getAdminConversionMetrics(options));
}

async function load_getAdminConversionMetrics(
  options?: AdminQueryOptions
): Promise<AdminConversionMetrics> {
  const supabase = getSupabaseAdmin();
  const scope = toScope(options);
  const [allPurchases, allPlans, assessmentsRes, authUsers] = await Promise.all([
    getCompletedPurchases(),
    getPlanInstances(),
    supabase.from("assessments").select("id, email, full_name"),
    getAuthUserMeta(),
  ]);

  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const purchases = filterPurchases(allPurchases, scope);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);
  const assessments = filterAssessments((assessmentsRes.data ?? []) as AssessmentRow[], scope);

  const assessmentsCompleted = assessments.length;
  const assessmentsStarted = assessmentsCompleted;
  const purchased = purchases.length;
  const currentlyActive = plans.filter((plan) => plan.status === "active").length;
  const completedProgram = plans.filter((plan) => plan.status === "completed").length;

  const assessmentToPurchaseRate =
    assessmentsCompleted > 0 ? (purchased / assessmentsCompleted) * 100 : 0;
  const purchaseToActiveRate = purchased > 0 ? (currentlyActive / purchased) * 100 : 0;
  const activeBase = currentlyActive + completedProgram;
  const activeToCompletedRate = activeBase > 0 ? (completedProgram / activeBase) * 100 : 0;
  const overallFunnelRate =
    assessmentsStarted > 0 ? (completedProgram / assessmentsStarted) * 100 : 0;

  return {
    visitorsLabel: "Site traffic not tracked yet",
    assessmentsStarted,
    assessmentsCompleted,
    purchased,
    currentlyActive,
    completedProgram,
    assessmentToPurchaseRate,
    purchaseToActiveRate,
    activeToCompletedRate,
    overallFunnelRate,
  };
}

export async function getAdminNotifications(
  options?: AdminQueryOptions
): Promise<AdminNotificationItem[]> {
  try {
    return await getAdminNotificationsUnsafe(options);
  } catch (error) {
    console.error("[admin] getAdminNotifications failed:", error);
    return [];
  }
}

async function getAdminNotificationsUnsafe(
  options?: AdminQueryOptions
): Promise<AdminNotificationItem[]> {
  const scope = toScope(options);
  const supabase = getSupabaseAdmin();
  const [customers, assessmentsRes, deliveries] = await Promise.all([
    getAdminCustomers({ includeTestData: scope.includeTestData }),
    supabase
      .from("assessments")
      .select("id, full_name, email, submitted_at")
      .order("submitted_at", { ascending: false })
      .limit(20),
    listEmailDeliveries({ limit: 100 }),
  ]);

  const notifications: AdminNotificationItem[] = [];
  const today = startOfDay(new Date());

  for (const customer of customers) {
    if (customer.purchaseDate && new Date(customer.purchaseDate) >= today) {
      notifications.push({
        id: `purchase-${customer.purchaseId}`,
        severity: "success",
        title: "New purchase today",
        detail: `${customer.name} · ${customer.email}`,
        occurredAt: customer.purchaseDate,
        href: `/admin/customers/${encodeURIComponent(customer.customerKey)}`,
      });
    }
    if (customer.lifecycleStatus === "completed") {
      notifications.push({
        id: `completed-${customer.customerKey}`,
        severity: "success",
        title: "Customer completed the program",
        detail: customer.name,
        occurredAt: customer.lastActiveAt ?? customer.purchaseDate ?? new Date().toISOString(),
        href: `/admin/customers/${encodeURIComponent(customer.customerKey)}`,
      });
    }
    if (customer.health === "at_risk") {
      notifications.push({
        id: `atrisk-${customer.customerKey}`,
        severity: "critical",
        title: "Customer hasn't logged in for 7+ days",
        detail: customer.name,
        occurredAt: customer.lastActiveAt ?? customer.purchaseDate ?? new Date().toISOString(),
        href: `/admin/customers/${encodeURIComponent(customer.customerKey)}`,
      });
    }
  }

  for (const assessment of filterAssessments(
    (assessmentsRes.data ?? []) as AssessmentRow[],
    scope
  )) {
    if (new Date(assessment.submitted_at) >= today) {
      notifications.push({
        id: `assessment-${assessment.id}`,
        severity: "info",
        title: "Assessment completed today",
        detail: `${assessment.full_name} · ${assessment.email}`,
        occurredAt: assessment.submitted_at,
        href: `/admin/assessments/${assessment.id}`,
      });
    }
  }

  for (const delivery of deliveries) {
    if (
      (delivery.emailType === "password_reset" || delivery.emailType === "account_access_setup") &&
      new Date(delivery.createdAt) >= daysAgo(2)
    ) {
      notifications.push({
        id: `reset-${delivery.id}`,
        severity: delivery.status === "failed" ? "warning" : "info",
        title:
          delivery.status === "failed"
            ? "Welcome / password email failed"
            : "Password reset / setup requested",
        detail: delivery.recipientEmail,
        occurredAt: delivery.createdAt,
      });
    }
    if (
      delivery.status === "failed" &&
      (delivery.emailType.includes("welcome") ||
        delivery.emailType === "customer_notification" ||
        delivery.emailType === "account_access_setup")
    ) {
      notifications.push({
        id: `fail-${delivery.id}`,
        severity: "warning",
        title: "Welcome email failed",
        detail: delivery.recipientEmail,
        occurredAt: delivery.createdAt,
      });
    }
  }

  return notifications
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 12);
}

export async function getAdminTrendAnalytics(
  options?: AdminQueryOptions
): Promise<AdminTrendAnalytics> {
  return withAdminFallback("getAdminTrendAnalytics", EMPTY_TREND_ANALYTICS, () => load_getAdminTrendAnalytics(options));
}

async function load_getAdminTrendAnalytics(
  options?: AdminQueryOptions
): Promise<AdminTrendAnalytics> {
  const scope = toScope(options);
  const supabase = getSupabaseAdmin();
  const [allPurchases, allPlans, authUsers, assessmentsRes, customers] = await Promise.all([
    getCompletedPurchases(),
    getPlanInstances(),
    getAuthUserMeta(),
    supabase.from("assessments").select("id, email, full_name, submitted_at"),
    getAdminCustomers({ includeTestData: scope.includeTestData }),
  ]);

  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const purchases = filterPurchases(allPurchases, scope);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);
  const assessments = filterAssessments((assessmentsRes.data ?? []) as AssessmentRow[], scope);

  const revenueTrend = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, amount: row.amount_cents })),
    30,
    "amount"
  );
  const purchasesByDay = buildDailySeries(
    purchases.map((row) => ({ date: row.purchased_at, count: 1 })),
    30,
    "count"
  );

  const weekMap = new Map<string, number>();
  for (const purchase of purchases) {
    const date = new Date(purchase.purchased_at);
    const weekStart = startOfDay(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
  }
  const purchasesByWeek = [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, value]) => ({ date, value }));

  const monthMap = new Map<string, number>();
  for (const purchase of purchases) {
    const key = toMonthKey(purchase.purchased_at);
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const purchasesByMonth = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, value]) => ({ date, value }));

  const assessmentTrend = buildDailySeries(
    assessments.map((row) => ({ date: row.submitted_at, count: 1 })),
    30,
    "count"
  );

  const averageCompletionRate =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + plan.completion_percentage, 0) / plans.length
      : 0;

  const finished = plans.filter((plan) => plan.status === "completed" && plan.completed_at);
  let averageDaysToFinish: number | null = null;
  if (finished.length) {
    const purchaseById = new Map(purchases.map((row) => [row.id, row]));
    const durations: number[] = [];
    for (const plan of finished) {
      const purchase = purchaseById.get(plan.purchase_id);
      if (!purchase?.purchased_at || !plan.completed_at) continue;
      const days =
        (new Date(plan.completed_at).getTime() - new Date(purchase.purchased_at).getTime()) /
        (1000 * 60 * 60 * 24);
      if (days >= 0) durations.push(days);
    }
    if (durations.length) {
      averageDaysToFinish =
        durations.reduce((sum, value) => sum + value, 0) / durations.length;
    }
  }

  const retentionActiveRate =
    customers.length > 0
      ? (customers.filter((row) => row.lifecycleStatus === "active").length / customers.length) *
        100
      : 0;

  return {
    revenueTrend,
    purchasesByDay,
    purchasesByWeek,
    purchasesByMonth,
    assessmentTrend,
    averageCompletionRate,
    averageDaysToFinish,
    retentionActiveRate,
    atRiskCount: customers.filter((row) => row.health === "at_risk").length,
  };
}

export async function getAdminAssessments(
  options?: AdminQueryOptions
): Promise<AdminAssessmentRow[]> {
  return withAdminFallback("getAdminAssessments", [], () => load_getAdminAssessments(options));
}

async function load_getAdminAssessments(
  options?: AdminQueryOptions
): Promise<AdminAssessmentRow[]> {
  const supabase = getSupabaseAdmin();
  const scope = toScope(options);
  const { data, error } = await supabase
    .from("assessments")
    .select("id, full_name, email, submitted_at, payment_status, analysis")
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("[admin] Failed to load assessments:", error.message);
    return [];
  }

  const rows = filterAssessments((data ?? []) as AssessmentRow[], scope);

  return rows.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    submittedAt: row.submitted_at,
    creatorStage:
      (row.analysis as AssessmentRecord["analysis"])?.preview?.currentCreatorStage ??
      (row.analysis as AssessmentRecord["analysis"])?.developmentFoundation?.creatorStage ??
      "—",
    paymentStatus: row.payment_status,
  }));
}

export async function getAdminAssessmentById(
  assessmentId: string,
  options?: AdminQueryOptions
): Promise<AssessmentRecord | null> {
  return withAdminFallback("getAdminAssessmentById", null, async () => {
    const supabase = getSupabaseAdmin();
    const scope = toScope(options);
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .maybeSingle();
    if (error) {
      console.error("[admin] getAdminAssessmentById failed:", error.message);
      return null;
    }
    if (!data) {
      return null;
    }
    const row = data as AssessmentRow;
    if (!scope.includeTestData && filterAssessments([row], scope).length === 0) {
      return null;
    }
    return mapAssessmentRow(row);
  });
}

export async function getAdminPlanAnalytics(
  options?: AdminQueryOptions
): Promise<AdminPlanAnalytics> {
  return withAdminFallback("getAdminPlanAnalytics", EMPTY_PLAN_ANALYTICS, () => load_getAdminPlanAnalytics(options));
}

async function load_getAdminPlanAnalytics(
  options?: AdminQueryOptions
): Promise<AdminPlanAnalytics> {
  const supabase = getSupabaseAdmin();
  const scope = toScope(options);
  const [allPurchases, allPlans, authUsers] = await Promise.all([
    getCompletedPurchases(),
    getPlanInstances(),
    getAuthUserMeta(),
  ]);
  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);

  const activePlans = plans.filter((plan) => plan.status === "active").length;
  const completedPlans = plans.filter((plan) => plan.status === "completed").length;
  const failedPlans = plans.filter((plan) => plan.status === "failed").length;
  const averageCompletion =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + plan.completion_percentage, 0) / plans.length
      : 0;
  const averageCurrentDay =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + plan.current_focus_day, 0) / plans.length
      : 0;

  const { data: completions } = await supabase
    .from("plan_task_completions")
    .select("plan_day_task_id, status, user_id, plan_day_tasks(title, is_required)")
    .eq("status", "completed");

  type CompletionRow = {
    plan_day_task_id: string;
    user_id: string;
    plan_day_tasks: { title?: string } | { title?: string }[] | null;
  };

  const scopedCompletions = filterByUserId(
    (completions ?? []) as CompletionRow[],
    scope,
    testUserIds
  );

  const completedCounts = new Map<string, number>();
  for (const row of scopedCompletions) {
    const task = row.plan_day_tasks;
    const title = Array.isArray(task) ? task[0]?.title : task?.title;
    if (!title) {
      continue;
    }
    completedCounts.set(title, (completedCounts.get(title) ?? 0) + 1);
  }

  const mostCompletedTasks = [...completedCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([title, count]) => ({ title, count }));

  const engagedPlans = plans.filter((plan) => {
    if (plan.status !== "active" && plan.status !== "completed") {
      return false;
    }
    return !(plan.current_focus_day === 1 && plan.completed_required_tasks === 0);
  });
  const engagedPlanIds = engagedPlans.map((plan) => plan.id);
  const plansById = new Map(engagedPlans.map((plan) => [plan.id, plan]));

  let mostSkippedTasks: Array<{ title: string; count: number }> = [];
  let hasSkippedTaskData = false;

  if (engagedPlanIds.length > 0) {
    const [{ data: requiredTasks }, { data: planCompletions }] = await Promise.all([
      supabase
        .from("plan_day_tasks")
        .select("id, title, plan_instance_id, plan_days(day_number)")
        .in("plan_instance_id", engagedPlanIds)
        .eq("is_required", true),
      supabase
        .from("plan_task_completions")
        .select("plan_day_task_id, plan_instance_id, user_id, status")
        .in("plan_instance_id", engagedPlanIds),
    ]);

    type PlanCompletionRow = {
      plan_day_task_id: string;
      plan_instance_id: string;
      user_id: string;
      status: string;
    };

    const scopedPlanCompletions = filterByUserId(
      (planCompletions ?? []) as PlanCompletionRow[],
      scope,
      testUserIds
    );

    const completionByTaskUser = new Map<string, PlanCompletionRow>();
    const engagedPlanIdsSet = new Set<string>();

    for (const row of scopedPlanCompletions) {
      completionByTaskUser.set(`${row.plan_day_task_id}:${row.user_id}`, row);
      if (row.status === "completed") {
        engagedPlanIdsSet.add(row.plan_instance_id);
      }
    }

    const skippedCounts = new Map<string, number>();

    for (const task of requiredTasks ?? []) {
      const plan = plansById.get(task.plan_instance_id as string);
      if (!plan) {
        continue;
      }

      const dayRelation = task.plan_days as { day_number?: number } | { day_number?: number }[] | null;
      const dayNumber = Array.isArray(dayRelation)
        ? dayRelation[0]?.day_number
        : dayRelation?.day_number;
      if (!dayNumber) {
        continue;
      }

      const planHasEngagement = engagedPlanIdsSet.has(plan.id);
      const dayPassed = dayNumber < plan.current_focus_day;
      const currentDayEngaged =
        dayNumber === plan.current_focus_day && planHasEngagement;

      if (!dayPassed && !currentDayEngaged) {
        continue;
      }

      const completion = completionByTaskUser.get(`${task.id}:${plan.user_id}`);
      if (!completion || completion.status !== "completed") {
        skippedCounts.set(task.title, (skippedCounts.get(task.title) ?? 0) + 1);
      }
    }

    hasSkippedTaskData = skippedCounts.size > 0;
    mostSkippedTasks = [...skippedCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([title, count]) => ({ title, count }));
  }

  const completionTimeline = buildDailySeries(
    plans
      .filter((plan) => plan.completed_at)
      .map((plan) => ({ date: plan.completed_at as string, count: 1 })),
    30,
    "count"
  );

  return {
    activePlans,
    completedPlans,
    failedPlans,
    averageCompletion,
    averageCurrentDay,
    mostCompletedTasks,
    mostSkippedTasks,
    hasSkippedTaskData,
    completionTimeline,
  };
}

export async function getAdminActivityMetrics(
  options?: AdminQueryOptions
): Promise<AdminActivityMetrics> {
  return withAdminFallback("getAdminActivityMetrics", EMPTY_ACTIVITY_METRICS, () => load_getAdminActivityMetrics(options));
}

async function load_getAdminActivityMetrics(
  options?: AdminQueryOptions
): Promise<AdminActivityMetrics> {
  const supabase = getSupabaseAdmin();
  const scope = toScope(options);
  const [allPlans, allPurchases, profiles, authUsers] = await Promise.all([
    getPlanInstances(),
    getCompletedPurchases(),
    getProfilesMap(),
    getAuthUserMeta(),
  ]);
  const authEmailByUserId = new Map(
    [...authUsers.entries()].map(([userId, meta]) => [userId, meta.email])
  );
  const testPurchaseIds = buildTestPurchaseIdSet(allPurchases);
  const testUserIds = buildTestUserIdSet(allPurchases, authEmailByUserId);
  const plans = filterPlans(allPlans, scope, testPurchaseIds, testUserIds);
  const purchases = filterPurchases(allPurchases, scope);

  const today = startOfDay(new Date());
  const weekAgo = daysAgo(7);
  const inactiveCutoff = daysAgo(7);

  const { data: todayCompletions } = await supabase
    .from("plan_task_completions")
    .select("user_id")
    .gte("updated_at", today.toISOString());

  const { data: weekCompletions } = await supabase
    .from("plan_task_completions")
    .select("user_id")
    .gte("updated_at", weekAgo.toISOString());

  const activeToday = new Set(
    filterByUserId((todayCompletions ?? []) as Array<{ user_id: string }>, scope, testUserIds).map(
      (row) => row.user_id
    )
  ).size;
  const activeThisWeek = new Set(
    filterByUserId((weekCompletions ?? []) as Array<{ user_id: string }>, scope, testUserIds).map(
      (row) => row.user_id
    )
  ).size;

  let inactive7PlusDays = 0;
  for (const purchase of purchases) {
    if (!purchase.user_id) {
      continue;
    }
    const auth = authUsers.get(purchase.user_id);
    if (!auth?.lastLogin || new Date(auth.lastLogin) < inactiveCutoff) {
      inactive7PlusDays += 1;
    }
  }

  const below20Percent = plans.filter((plan) => plan.completion_percentage < 20).length;
  const above80Percent = plans.filter((plan) => plan.completion_percentage >= 80).length;

  const recentlyCompleted = plans
    .filter((plan) => plan.status === "completed" && plan.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 10)
    .map((plan) => {
      const purchase = purchases.find((row) => row.id === plan.purchase_id);
      const profile = profiles.get(plan.user_id);
      return {
        customerKey: buildCustomerKey(plan.user_id, plan.purchase_id),
        name: profile?.fullName || purchase?.customer_email.split("@")[0] || "Customer",
        email: purchase?.customer_email ?? profile?.email ?? "—",
        completedAt: plan.completed_at as string,
        progressPercent: plan.completion_percentage,
      };
    });

  return {
    activeToday,
    activeThisWeek,
    inactive7PlusDays,
    below20Percent,
    above80Percent,
    recentlyCompleted,
  };
}

export async function getAdminPurchasesForExport(options?: AdminQueryOptions) {
  return withAdminFallback("getAdminPurchasesForExport", [], async () => {
    const scope = toScope(options);
    return filterPurchases(await getCompletedPurchases(), scope);
  });
}

export async function getAdminAssessmentsForExport(options?: AdminQueryOptions) {
  return withAdminFallback("getAdminAssessmentsForExport", [], async () => {
    const supabase = getSupabaseAdmin();
    const scope = toScope(options);
    const { data, error } = await supabase
      .from("assessments")
      .select("id, full_name, email, submitted_at, payment_status, analysis")
      .order("submitted_at", { ascending: false });
    if (error) {
      console.error("[admin] getAdminAssessmentsForExport failed:", error.message);
      return [];
    }
    return filterAssessments((data ?? []) as AssessmentRow[], scope);
  });
}

export async function getAdminEmailDeliveries(
  options?: AdminQueryOptions & {
    status?: "sent" | "failed";
    limit?: number;
  }
): Promise<EmailDeliveryRecord[]> {
  return withAdminFallback("getAdminEmailDeliveries", [], async () => {
    const scope = toScope(options);
    const deliveries = await listEmailDeliveries({
      limit: options?.limit ?? 500,
      status: options?.status,
    });
    return filterEmailRecipient(deliveries, scope);
  });
}

export async function getAdminEmailStats(options?: AdminQueryOptions): Promise<{
  totalSent: number;
  totalFailed: number;
}> {
  return withAdminFallback(
    "getAdminEmailStats",
    { totalSent: 0, totalFailed: 0 },
    async () => {
      const deliveries = await getAdminEmailDeliveries({
        includeTestData: options?.includeTestData,
        limit: 5000,
      });
      return {
        totalSent: deliveries.filter((row) => row.status === "sent").length,
        totalFailed: deliveries.filter((row) => row.status === "failed").length,
      };
    }
  );
}

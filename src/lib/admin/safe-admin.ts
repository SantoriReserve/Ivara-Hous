import type {
  AdminActivityMetrics,
  AdminConversionMetrics,
  AdminOverviewMetrics,
  AdminPlanAnalytics,
  AdminRevenueMetrics,
  AdminTrendAnalytics,
} from "@/lib/admin/admin-types";

export function safeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export async function withAdminFallback<T>(
  label: string,
  fallback: T,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[admin] ${label} failed:`, error);
    return fallback;
  }
}

const emptySeries = (days = 30) => {
  const series: Array<{ date: string; value: number }> = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);
    series.push({ date: date.toISOString().slice(0, 10), value: 0 });
  }
  return series;
};

export const EMPTY_OVERVIEW_METRICS: AdminOverviewMetrics = {
  totalRevenueCents: 0,
  totalCustomers: 0,
  totalPurchases: 0,
  totalAssessments: 0,
  assessmentToPurchaseRate: 0,
  activePlans: 0,
  completedPlans: 0,
  failedPlans: 0,
  averagePlanCompletion: 0,
  averageCurrentDay: 0,
  newCustomers7Days: 0,
  newCustomers30Days: 0,
  revenueOverTime: emptySeries(30),
  purchasesOverTime: emptySeries(30),
  newUsersOverTime: emptySeries(30),
  planCompletionDistribution: [
    { label: "0–20%", count: 0 },
    { label: "21–40%", count: 0 },
    { label: "41–60%", count: 0 },
    { label: "61–80%", count: 0 },
    { label: "81–100%", count: 0 },
  ],
};

export const EMPTY_REVENUE_METRICS: AdminRevenueMetrics = {
  revenueTodayCents: 0,
  revenueWeekCents: 0,
  revenueMonthCents: 0,
  revenueAllTimeCents: 0,
  averageOrderValueCents: 0,
  refundsCents: 0,
  dailyRevenue: emptySeries(30),
  monthlyRevenue: [],
  purchaseCountSeries: emptySeries(30),
  totalPurchaseCount: 0,
};

export const EMPTY_CONVERSION_METRICS: AdminConversionMetrics = {
  visitorsLabel: "Site traffic not tracked yet",
  assessmentsStarted: 0,
  assessmentsCompleted: 0,
  purchased: 0,
  currentlyActive: 0,
  completedProgram: 0,
  assessmentToPurchaseRate: 0,
  purchaseToActiveRate: 0,
  activeToCompletedRate: 0,
  overallFunnelRate: 0,
};

export const EMPTY_TREND_ANALYTICS: AdminTrendAnalytics = {
  revenueTrend: emptySeries(30),
  purchasesByDay: emptySeries(30),
  purchasesByWeek: [],
  purchasesByMonth: [],
  assessmentTrend: emptySeries(30),
  averageCompletionRate: 0,
  averageDaysToFinish: null,
  retentionActiveRate: 0,
  atRiskCount: 0,
};

export const EMPTY_PLAN_ANALYTICS: AdminPlanAnalytics = {
  activePlans: 0,
  completedPlans: 0,
  failedPlans: 0,
  averageCompletion: 0,
  averageCurrentDay: 0,
  mostCompletedTasks: [],
  mostSkippedTasks: [],
  hasSkippedTaskData: false,
  completionTimeline: emptySeries(30),
};

export const EMPTY_ACTIVITY_METRICS: AdminActivityMetrics = {
  activeToday: 0,
  activeThisWeek: 0,
  inactive7PlusDays: 0,
  below20Percent: 0,
  above80Percent: 0,
  recentlyCompleted: [],
};

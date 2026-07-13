import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminDistributionChart } from "@/components/admin/AdminDistributionChart";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency, formatPercent } from "@/lib/admin/admin-format";
import {
  getAdminNotifications,
  getAdminOverviewMetrics,
} from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type AdminHomePageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

function withTest(path: string, includeTestData: boolean, extra = "") {
  const params = new URLSearchParams();
  if (includeTestData) params.set("includeTestData", "true");
  if (extra) {
    const extraParams = new URLSearchParams(extra);
    extraParams.forEach((value, key) => params.set(key, value));
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const [metrics, notifications] = await Promise.all([
    getAdminOverviewMetrics({ includeTestData }),
    getAdminNotifications({ includeTestData }),
  ]);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Executive Overview"
        title="Business Command Center"
        description="Understand customers and business health in seconds — then drill into the signal that matters."
        actions={
          <>
            <AdminExportLink
              href="/api/admin/export/customers"
              label="Export Customers"
              includeTestData={includeTestData}
            />
            <AdminExportLink
              href="/api/admin/export/purchases"
              label="Export Revenue"
              includeTestData={includeTestData}
            />
            <AdminExportLink
              href="/api/admin/export/progress"
              label="Export Progress"
              includeTestData={includeTestData}
            />
          </>
        }
      />

      <AdminNotificationCenter notifications={notifications} />

      <AdminMetricGrid
        metrics={[
          {
            label: "Total Revenue",
            value: formatCurrency(metrics.totalRevenueCents),
            href: withTest(ROUTES.adminRevenue, includeTestData),
          },
          {
            label: "Total Customers",
            value: String(metrics.totalCustomers),
            href: withTest(ROUTES.adminCustomers, includeTestData),
          },
          {
            label: "Total Purchases",
            value: String(metrics.totalPurchases),
            href: withTest(ROUTES.adminRevenue, includeTestData),
          },
          {
            label: "Total Assessments",
            value: String(metrics.totalAssessments),
            href: withTest(ROUTES.adminAssessments, includeTestData),
          },
          {
            label: "Assessment → Purchase",
            value: formatPercent(metrics.assessmentToPurchaseRate, 1),
            href: withTest(ROUTES.adminConversion, includeTestData),
          },
          {
            label: "Active Plans",
            value: String(metrics.activePlans),
            href: withTest(ROUTES.adminCustomers, includeTestData, "filter=plan_active"),
          },
          {
            label: "Completed Plans",
            value: String(metrics.completedPlans),
            href: withTest(ROUTES.adminCustomers, includeTestData, "filter=completed"),
          },
          {
            label: "Failed Plans",
            value: String(metrics.failedPlans),
            href: withTest(ROUTES.adminCustomers, includeTestData, "filter=failed"),
          },
          {
            label: "Avg Plan Completion",
            value: formatPercent(metrics.averagePlanCompletion, 1),
            href: withTest(ROUTES.adminAnalytics, includeTestData),
          },
          {
            label: "Avg Current Day",
            value: metrics.averageCurrentDay.toFixed(1),
            href: withTest(ROUTES.adminAnalytics, includeTestData),
          },
          {
            label: "New Customers (7d)",
            value: String(metrics.newCustomers7Days),
            href: withTest(ROUTES.adminCustomers, includeTestData),
          },
          {
            label: "New Customers (30d)",
            value: String(metrics.newCustomers30Days),
            href: withTest(ROUTES.adminCustomers, includeTestData),
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminBarChart
          title="Revenue (30 Days)"
          data={metrics.revenueOverTime}
          valueFormatter={(value) => formatCurrency(value)}
        />
        <AdminBarChart title="Purchases (30 Days)" data={metrics.purchasesOverTime} />
        <AdminBarChart title="New Users (30 Days)" data={metrics.newUsersOverTime} />
        <AdminDistributionChart
          title="Plan Completion Distribution"
          data={metrics.planCompletionDistribution}
        />
      </div>
    </div>
  );
}

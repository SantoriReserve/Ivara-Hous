import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminDistributionChart } from "@/components/admin/AdminDistributionChart";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency, formatPercent } from "@/lib/admin/admin-format";
import { getAdminOverviewMetrics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";

type AdminHomePageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminHomePage({ searchParams }: AdminHomePageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const metrics = await getAdminOverviewMetrics({ includeTestData });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Executive Overview"
        title="Business Command Center"
        description="Run Ivara Hous from one place — customers, revenue, plans, assessments, and communications."
        actions={
          <>
            <AdminExportLink
              href="/api/admin/export/customers"
              label="Export Customers"
              includeTestData={includeTestData}
            />
            <AdminExportLink
              href="/api/admin/export/purchases"
              label="Export Purchases"
              includeTestData={includeTestData}
            />
          </>
        }
      />

      <AdminMetricGrid
        metrics={[
          { label: "Total Revenue", value: formatCurrency(metrics.totalRevenueCents) },
          { label: "Total Customers", value: String(metrics.totalCustomers) },
          { label: "Total Purchases", value: String(metrics.totalPurchases) },
          { label: "Total Assessments", value: String(metrics.totalAssessments) },
          {
            label: "Assessment → Purchase",
            value: formatPercent(metrics.assessmentToPurchaseRate, 1),
          },
          { label: "Active Plans", value: String(metrics.activePlans) },
          { label: "Completed Plans", value: String(metrics.completedPlans) },
          {
            label: "Avg Plan Completion",
            value: formatPercent(metrics.averagePlanCompletion, 1),
          },
          { label: "New Customers (7d)", value: String(metrics.newCustomers7Days) },
          { label: "New Customers (30d)", value: String(metrics.newCustomers30Days) },
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

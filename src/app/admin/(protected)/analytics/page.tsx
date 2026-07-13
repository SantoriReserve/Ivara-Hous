import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency, formatPercent } from "@/lib/admin/admin-format";
import { getAdminTrendAnalytics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type AnalyticsPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const analytics = await getAdminTrendAnalytics({ includeTestData });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Analytics"
        title="Trends & Patterns"
        description="Identify momentum, retention risk, and completion behavior across the Creator Development System."
        actions={
          <>
            <AdminExportLink
              href="/api/admin/export/assessments"
              label="Export Assessments"
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

      <AdminMetricGrid
        metrics={[
          {
            label: "Average Completion Rate",
            value: formatPercent(analytics.averageCompletionRate, 1),
          },
          {
            label: "Avg Days to Finish",
            value:
              analytics.averageDaysToFinish != null
                ? analytics.averageDaysToFinish.toFixed(1)
                : "—",
          },
          {
            label: "Retention (Active)",
            value: formatPercent(analytics.retentionActiveRate, 1),
          },
          {
            label: "At Risk Customers",
            value: String(analytics.atRiskCount),
            href: `${ROUTES.adminCustomers}?filter=at_risk${includeTestData ? "&includeTestData=true" : ""}`,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminBarChart
          title="Revenue Trend (30 Days)"
          data={analytics.revenueTrend}
          valueFormatter={(value) => formatCurrency(value)}
        />
        <AdminBarChart title="Purchases by Day" data={analytics.purchasesByDay} />
        <AdminBarChart title="Purchases by Week" data={analytics.purchasesByWeek} />
        <AdminBarChart
          title="Purchases by Month"
          data={analytics.purchasesByMonth}
          labelMode="monthly"
          maxBars={12}
        />
        <AdminBarChart
          title="Assessment Completion Trend"
          data={analytics.assessmentTrend}
        />
      </div>
    </div>
  );
}

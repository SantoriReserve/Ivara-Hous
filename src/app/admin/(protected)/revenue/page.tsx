import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatCurrency } from "@/lib/admin/admin-format";
import { getAdminRevenueMetrics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";

type AdminRevenuePageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminRevenuePage({ searchParams }: AdminRevenuePageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const metrics = await getAdminRevenueMetrics({ includeTestData });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Revenue"
        title="Revenue Intelligence"
        description="Platform purchase totals aligned with Stripe checkout records stored in Supabase."
        actions={
          <AdminExportLink
            href="/api/admin/export/purchases"
            label="Export Purchases"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminMetricGrid
        metrics={[
          { label: "Revenue Today", value: formatCurrency(metrics.revenueTodayCents) },
          { label: "Revenue This Week", value: formatCurrency(metrics.revenueWeekCents) },
          { label: "Revenue This Month", value: formatCurrency(metrics.revenueMonthCents) },
          { label: "Revenue All Time", value: formatCurrency(metrics.revenueAllTimeCents) },
          { label: "Total Purchases", value: String(metrics.totalPurchaseCount) },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminBarChart
          title="Daily Revenue (30 Days)"
          data={metrics.dailyRevenue}
          valueFormatter={(value) => formatCurrency(value)}
        />
        <AdminBarChart
          title="Monthly Revenue"
          data={metrics.monthlyRevenue}
          valueFormatter={(value) => formatCurrency(value)}
          labelMode="monthly"
          maxBars={12}
        />
        <AdminBarChart title="Daily Purchase Count" data={metrics.purchaseCountSeries} />
      </div>
    </div>
  );
}

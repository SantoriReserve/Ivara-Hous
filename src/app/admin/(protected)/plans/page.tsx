import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatPercent } from "@/lib/admin/admin-format";
import { getAdminPlanAnalytics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type AdminPlansPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminPlansPage({ searchParams }: AdminPlansPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const analytics = await getAdminPlanAnalytics({ includeTestData });
  const testSuffix = includeTestData ? "&includeTestData=true" : "";

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Plan Analytics"
        title="40-Day Plan Performance"
        description="Completion trends, engagement signals, and task behavior across all customer plans."
      />

      <AdminMetricGrid
        metrics={[
          {
            label: "Active Plans",
            value: String(analytics.activePlans),
            href: `${ROUTES.adminCustomers}?filter=active${testSuffix}`,
          },
          {
            label: "Completed Plans",
            value: String(analytics.completedPlans),
            href: `${ROUTES.adminCustomers}?filter=completed${testSuffix}`,
          },
          {
            label: "Failed Plans",
            value: String(analytics.failedPlans),
            href: `${ROUTES.adminCustomers}?filter=not_started${testSuffix}`,
          },
          {
            label: "Average Completion",
            value: formatPercent(analytics.averageCompletion, 1),
            detail: "Completion analytics",
          },
          {
            label: "Average Current Day",
            value: analytics.averageCurrentDay.toFixed(1),
            detail: "Progress analytics",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-black/10 p-6">
          <h3 className="mb-2 font-serif text-xl text-black">Most Completed Tasks</h3>
          <p className="mb-4 font-sans text-xs uppercase tracking-nav text-gray-muted">
            Task Analytics
          </p>
          <ul className="space-y-3">
            {analytics.mostCompletedTasks.map((task) => (
              <li key={task.title} className="flex items-center justify-between font-sans text-sm">
                <span>{task.title}</span>
                <span className="text-gray-mid">{task.count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-black/10 p-6">
          <h3 className="mb-2 font-serif text-xl text-black">Most Skipped Tasks</h3>
          <p className="mb-4 font-sans text-xs uppercase tracking-nav text-gray-muted">
            Improvement Insights
          </p>
          {analytics.hasSkippedTaskData ? (
            <ul className="space-y-3">
              {analytics.mostSkippedTasks.map((task) => (
                <li key={task.title} className="flex items-center justify-between font-sans text-sm">
                  <span>{task.title}</span>
                  <span className="text-gray-mid">{task.count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-gray-mid">Not enough activity data yet.</p>
          )}
        </section>
      </div>

      <AdminBarChart
        title="Plan Completions Over Time (30 Days)"
        data={analytics.completionTimeline}
      />
    </div>
  );
}

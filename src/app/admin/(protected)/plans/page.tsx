import { AdminBarChart } from "@/components/admin/AdminBarChart";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatPercent } from "@/lib/admin/admin-format";
import { getAdminPlanAnalytics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";

type AdminPlansPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminPlansPage({ searchParams }: AdminPlansPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const analytics = await getAdminPlanAnalytics({ includeTestData });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Plan Analytics"
        title="40-Day Plan Performance"
        description="Completion trends, engagement signals, and task behavior across all customer plans."
      />

      <AdminMetricGrid
        metrics={[
          { label: "Active Plans", value: String(analytics.activePlans) },
          { label: "Completed Plans", value: String(analytics.completedPlans) },
          { label: "Failed Plans", value: String(analytics.failedPlans) },
          {
            label: "Average Completion",
            value: formatPercent(analytics.averageCompletion, 1),
          },
          {
            label: "Average Current Day",
            value: analytics.averageCurrentDay.toFixed(1),
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="border border-black/10 p-6">
          <h3 className="mb-4 font-serif text-xl text-black">Most Completed Tasks</h3>
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
          <h3 className="mb-4 font-serif text-xl text-black">Most Skipped Tasks</h3>
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

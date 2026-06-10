import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { customerProfilePath, formatDate, formatPercent } from "@/lib/admin/admin-format";
import { getAdminActivityMetrics } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";

type AdminActivityPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminActivityPage({ searchParams }: AdminActivityPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const activity = await getAdminActivityMetrics({ includeTestData });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Activity Center"
        title="Customer Engagement Signals"
        description="Who is active, who needs attention, and who recently completed their plan."
      />

      <AdminMetricGrid
        metrics={[
          { label: "Active Today", value: String(activity.activeToday) },
          { label: "Active This Week", value: String(activity.activeThisWeek) },
          { label: "Inactive 7+ Days", value: String(activity.inactive7PlusDays) },
          { label: "Below 20% Completion", value: String(activity.below20Percent) },
          { label: "Above 80% Completion", value: String(activity.above80Percent) },
        ]}
      />

      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-black">Recently Completed Plans</h3>
        <AdminDataTable
          rows={activity.recentlyCompleted}
          columns={[
            {
              key: "name",
              header: "Customer",
              render: (row) => (
                <Link
                  href={customerProfilePath(row.customerKey, includeTestData)}
                  className="hover:underline"
                >
                  {row.name}
                </Link>
              ),
            },
            { key: "email", header: "Email", render: (row) => row.email },
            {
              key: "completed",
              header: "Completed",
              render: (row) => formatDate(row.completedAt),
            },
            {
              key: "progress",
              header: "Progress",
              render: (row) => formatPercent(row.progressPercent, 0),
            },
          ]}
          emptyMessage="No completed plans yet."
        />
      </section>
    </div>
  );
}

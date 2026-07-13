import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  customerProfilePath,
  formatDateTime,
  formatPercent,
} from "@/lib/admin/admin-format";
import { getAdminCustomerDetail } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";

type PreviewPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminCustomerDashboardPreviewPage({
  params,
  searchParams,
}: PreviewPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const includeTestData = parseIncludeTestData(query.includeTestData);
  const customer = await getAdminCustomerDetail(decodeURIComponent(id), { includeTestData });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Admin View"
        title={`${customer.name}'s Dashboard`}
        description="Read-only customer operating snapshot. This does not sign you in as the customer."
        actions={
          <Link
            href={customerProfilePath(customer.customerKey, includeTestData)}
            className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
          >
            Back to Profile
          </Link>
        }
      />

      <div className="border border-black/10 bg-black p-8 text-white">
        <p className="luxury-label text-white/50">Today</p>
        <h2 className="mt-3 font-serif text-3xl">
          {customer.currentDay != null ? `Day ${customer.currentDay} of 40` : "Plan not started"}
        </h2>
        <p className="mt-3 max-w-xl font-sans text-sm text-white/70">
          {customer.planTitle} ·{" "}
          {customer.progressPercent != null
            ? `${formatPercent(customer.progressPercent, 0)} complete`
            : "No progress yet"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Tasks Completed", String(customer.tasksCompleted)],
          ["Tasks Remaining", String(customer.tasksRemaining)],
          ["Tasks Skipped", String(customer.tasksSkipped)],
          ["Last Activity", formatDateTime(customer.lastDashboardActivity)],
        ].map(([label, value]) => (
          <div key={label} className="border border-black/10 p-4">
            <p className="luxury-label mb-2 text-gray-muted">{label}</p>
            <p className="font-sans text-sm text-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Recent Activity</h3>
        <ul className="mt-4 space-y-3">
          {customer.timeline.slice(0, 8).map((event) => (
            <li key={event.id} className="font-sans text-sm text-black">
              <span className="text-gray-muted">{formatDateTime(event.occurredAt)}</span>
              <span className="mx-2 text-gray-muted">·</span>
              {event.label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

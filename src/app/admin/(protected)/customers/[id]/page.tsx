import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCustomerQuickActions } from "@/components/admin/AdminCustomerQuickActions";
import {
  AdminCustomerNotesPanel,
  AdminCustomerTagsPanel,
} from "@/components/admin/AdminCustomerCrmPanels";
import { AdminCustomerSnapshot } from "@/components/admin/AdminCustomerSnapshot";
import { AdminDayProgressTracker } from "@/components/admin/AdminDayProgressTracker";
import { AdminEmailHistorySection } from "@/components/admin/AdminEmailHistorySection";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  AdminHealthBadge,
  AdminLifecycleBadge,
  AdminSourceBadge,
} from "@/components/admin/AdminStatusBadges";
import {
  customerProfilePath,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/admin/admin-format";
import { getAdminCustomerDetail } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

type CustomerProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminCustomerProfilePage({
  params,
  searchParams,
}: CustomerProfilePageProps) {
  const { id } = await params;
  const query = await searchParams;
  const includeTestData = parseIncludeTestData(query.includeTestData);
  const customer = await getAdminCustomerDetail(decodeURIComponent(id), { includeTestData });

  if (!customer) {
    notFound();
  }

  const assessment = customer.assessment;
  const insights = customer.assessmentInsights;

  return (
    <div className="space-y-10">
      <AdminPageHeader
        eyebrow="Customer Profile"
        title={customer.name}
        description={customer.email}
        actions={
          <Link
            href={
              includeTestData
                ? `${ROUTES.adminCustomers}?includeTestData=true`
                : ROUTES.adminCustomers
            }
            className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
          >
            Back to Plan Customers
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <AdminLifecycleBadge status={customer.lifecycleStatus} />
        <AdminHealthBadge health={customer.health} />
        <AdminSourceBadge source={customer.source} />
        {customer.tags.map((tag) => (
          <span
            key={tag}
            className="border border-black/15 px-2 py-1 font-sans text-xs uppercase tracking-nav text-gray-mid"
          >
            {tag}
          </span>
        ))}
      </div>

      <AdminCustomerSnapshot snapshot={customer.snapshot} />

      <AdminCustomerQuickActions
        customerKey={customer.customerKey}
        email={customer.email}
        assessmentId={assessment?.assessmentId ?? null}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminDayProgressTracker currentDay={customer.currentDay} />
        <section className="border border-black/10 p-6">
          <h3 className="font-serif text-2xl text-black">Progress Summary</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["Tasks Completed", String(customer.tasksCompleted)],
              ["Tasks Remaining", String(customer.tasksRemaining)],
              ["Tasks Skipped", String(customer.tasksSkipped)],
              ["Consecutive Days", String(customer.consecutiveDaysActive)],
              ["Last Login", formatDateTime(customer.lastLogin)],
              ["Last Activity", formatDateTime(customer.lastDashboardActivity)],
            ].map(([label, value]) => (
              <div key={label} className="border border-black/10 p-3">
                <p className="luxury-label mb-1 text-gray-muted">{label}</p>
                <p className="font-sans text-sm text-black">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCustomerNotesPanel customerKey={customer.customerKey} notes={customer.notes} />
        <AdminCustomerTagsPanel customerKey={customer.customerKey} tags={customer.tags} />
      </div>

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Assessment Insights</h3>
        {assessment ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-black/10 p-4">
                <p className="luxury-label mb-2 text-gray-muted">Overall Score</p>
                <p className="font-serif text-3xl">
                  {insights.overallScore != null ? insights.overallScore : "—"}
                </p>
              </div>
              <div className="border border-black/10 p-4 sm:col-span-1 lg:col-span-3">
                <p className="luxury-label mb-2 text-gray-muted">Recommended Focus</p>
                <p className="font-sans text-sm text-black">
                  {insights.nextAction || "—"}
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="luxury-label mb-3 text-gray-muted">Top Strengths</p>
                <ul className="space-y-2">
                  {insights.topStrengths.map((item) => (
                    <li key={item} className="font-sans text-sm text-black">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="luxury-label mb-3 text-gray-muted">Biggest Improvement Areas</p>
                <ul className="space-y-2">
                  {insights.improvementAreas.map((item) => (
                    <li key={item} className="font-sans text-sm text-black">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="luxury-label mb-3 text-gray-muted">Recommended Resources</p>
                <ul className="space-y-2">
                  {insights.recommendedResources.map((item) => (
                    <li key={item} className="font-sans text-sm text-black">
                      {item}
                    </li>
                  ))}
                  {insights.recommendedFocus.slice(0, 3).map((item) => (
                    <li key={`focus-${item}`} className="font-sans text-sm text-gray-mid">
                      Focus: {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link
              href={`/admin/assessments/${assessment.assessmentId}`}
              className="inline-block font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
            >
              Open Full Assessment →
            </Link>
          </>
        ) : (
          <p className="font-sans text-sm text-gray-mid">
            No linked free assessment for this purchase.
          </p>
        )}
      </section>

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Overview</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Name", customer.name],
            ["Email", customer.email],
            ["Join Date", formatDate(customer.joinDate)],
            ["Total Revenue", formatCurrency(customer.totalRevenueCents)],
            ["Plan Purchased", customer.planTitle],
            ["Payment Status", customer.paymentStatus],
            ["Purchase Date", formatDate(customer.purchaseDate)],
            [
              "Amount Paid",
              customer.amountPaidCents != null ? formatCurrency(customer.amountPaidCents) : "—",
            ],
          ].map(([label, value]) => (
            <div key={label} className="border border-black/10 p-4">
              <p className="luxury-label mb-2 text-gray-muted">{label}</p>
              <p className="font-sans text-sm text-black">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {customer.allPurchases.length > 0 ? (
        <section className="space-y-4 border border-black/10 p-6">
          <h3 className="font-serif text-2xl text-black">Purchase History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/10">
              <thead>
                <tr className="text-left font-sans text-xs uppercase tracking-nav text-gray-muted">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Payment</th>
                  <th className="px-3 py-2">Plan Status</th>
                  <th className="px-3 py-2">Progress</th>
                  <th className="px-3 py-2">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {customer.allPurchases.map((purchase) => (
                  <tr key={purchase.purchaseId}>
                    <td className="px-3 py-2 font-sans text-sm">
                      {formatDate(purchase.purchaseDate)}
                    </td>
                    <td className="px-3 py-2 font-sans text-sm">
                      {formatCurrency(purchase.amountPaidCents)}
                    </td>
                    <td className="px-3 py-2 font-sans text-sm">{purchase.paymentStatus}</td>
                    <td className="px-3 py-2 font-sans text-sm">{purchase.planStatus ?? "—"}</td>
                    <td className="px-3 py-2 font-sans text-sm">
                      {purchase.progressPercent != null
                        ? formatPercent(purchase.progressPercent, 0)
                        : "—"}
                    </td>
                    <td className="px-3 py-2 font-sans text-sm">
                      {purchase.purchaseId === customer.purchaseId ? (
                        "Current"
                      ) : (
                        <Link
                          href={customerProfilePath(purchase.customerKey, includeTestData)}
                          className="hover:underline"
                        >
                          Open
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <AdminEmailHistorySection emails={customer.emails} />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 border border-black/10 p-6">
          <h3 className="font-serif text-2xl text-black">Content Progress</h3>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Planned", customer.content.planned],
                ["Filmed", customer.content.filmed],
                ["Edited", customer.content.edited],
                ["Posted", customer.content.posted],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="border border-black/10 p-3">
                <p className="luxury-label mb-1 text-gray-muted">{label}</p>
                <p className="font-serif text-2xl text-black">{value}</p>
              </div>
            ))}
          </div>
          {customer.content.planned +
            customer.content.filmed +
            customer.content.edited +
            customer.content.posted ===
          0 ? (
            <p className="font-sans text-sm text-gray-mid">No content activity yet.</p>
          ) : null}
        </section>

        <section className="space-y-4 border border-black/10 p-6">
          <h3 className="font-serif text-2xl text-black">Learning Insights</h3>
          {customer.learningInsights.length ? (
            <ul className="space-y-3">
              {customer.learningInsights.slice(0, 6).map((insight) => (
                <li key={insight.id} className="border border-black/10 p-3">
                  <p className="luxury-label mb-1 text-gray-muted">
                    Day {insight.dayNumber} · {formatDateTime(insight.createdAt)}
                  </p>
                  <p className="font-sans text-xs text-gray-mid">{insight.prompt}</p>
                  <p className="mt-2 font-sans text-sm text-black">{insight.response}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-sm text-gray-mid">No learning insights yet.</p>
          )}
        </section>
      </div>

      <section id="activity-timeline" className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Customer Journey</h3>
        <p className="font-sans text-sm text-gray-mid">
          Chronological timeline across assessment, purchase, access, and plan progress.
        </p>
        {customer.timeline.length ? (
          <ol className="space-y-0">
            {customer.timeline.map((event) => (
              <li
                key={event.id}
                className="grid gap-2 border-t border-black/10 py-4 first:border-t-0 md:grid-cols-[11rem_1fr]"
              >
                <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">
                  {formatDateTime(event.occurredAt)}
                </p>
                <div>
                  <p className="font-sans text-sm text-black">{event.label}</p>
                  {event.detail ? (
                    <p className="mt-1 font-sans text-sm text-gray-mid">{event.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="font-sans text-sm text-gray-mid">No journey events yet.</p>
        )}
      </section>
    </div>
  );
}

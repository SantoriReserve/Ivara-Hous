import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCustomerQuickActions } from "@/components/admin/AdminCustomerQuickActions";
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
      </div>

      <AdminCustomerQuickActions
        customerKey={customer.customerKey}
        email={customer.email}
        assessmentId={assessment?.assessmentId ?? null}
      />

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

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Progress</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [
              "Current Day",
              customer.currentDay != null ? `Day ${customer.currentDay}/40` : "—",
            ],
            [
              "Overall Progress",
              customer.progressPercent != null
                ? formatPercent(customer.progressPercent, 0)
                : "—",
            ],
            ["Tasks Completed", String(customer.tasksCompleted)],
            ["Tasks Remaining", String(customer.tasksRemaining)],
            ["Tasks Skipped", String(customer.tasksSkipped)],
            ["Consecutive Days Active", String(customer.consecutiveDaysActive)],
            ["Last Login", formatDateTime(customer.lastLogin)],
            ["Last Activity", formatDateTime(customer.lastDashboardActivity)],
          ].map(([label, value]) => (
            <div key={label} className="border border-black/10 p-4">
              <p className="luxury-label mb-2 text-gray-muted">{label}</p>
              <p className="font-sans text-sm text-black">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {assessment ? (
        <section className="space-y-4 border border-black/10 p-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-2xl text-black">Assessment</h3>
            <Link
              href={`/admin/assessments/${assessment.assessmentId}`}
              className="font-sans text-xs uppercase tracking-nav text-gray-mid hover:text-black"
            >
              Open Full Assessment
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="luxury-label mb-2 text-gray-muted">Creator Stage</p>
              <p className="font-sans text-sm">{assessment.analysis.preview.currentCreatorStage}</p>
            </div>
            <div>
              <p className="luxury-label mb-2 text-gray-muted">Recommended Path</p>
              <p className="font-sans text-sm">
                {assessment.analysis.preview.recommendedNextStep ||
                  assessment.analysis.preview.creatorArchetype}
              </p>
            </div>
            <div>
              <p className="luxury-label mb-2 text-gray-muted">Average Score</p>
              <p className="font-serif text-2xl">
                {customer.assessmentScore != null ? customer.assessmentScore : "—"}
              </p>
            </div>
            <div>
              <p className="luxury-label mb-2 text-gray-muted">Biggest Challenge</p>
              <p className="font-sans text-sm">{assessment.answers.biggestChallenge || "—"}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {Object.entries(assessment.analysis.scores).map(([key, score]) => (
              <div key={key} className="border border-black/10 p-3">
                <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">{key}</p>
                <p className="mt-1 font-serif text-xl">{score}</p>
              </div>
            ))}
          </div>
          <details className="border border-black/10 p-4">
            <summary className="cursor-pointer font-sans text-sm text-black">
              Assessment Answers
            </summary>
            <dl className="mt-4 space-y-3">
              {Object.entries(assessment.answers).map(([key, value]) => (
                <div key={key}>
                  <dt className="luxury-label text-gray-muted">{key}</dt>
                  <dd className="mt-1 font-sans text-sm text-black">
                    {String(value || "—")}
                  </dd>
                </div>
              ))}
            </dl>
          </details>
        </section>
      ) : (
        <section className="border border-black/10 p-6">
          <h3 className="font-serif text-2xl text-black">Assessment</h3>
          <p className="mt-3 font-sans text-sm text-gray-mid">
            No linked free assessment for this purchase.
          </p>
        </section>
      )}

      <section id="activity-timeline" className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Activity Timeline</h3>
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
          <p className="font-sans text-sm text-gray-mid">No activity recorded yet.</p>
        )}
      </section>

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Content Tracking</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["Planned", customer.content.planned],
            ["Filmed", customer.content.filmed],
            ["Edited", customer.content.edited],
            ["Posted", customer.content.posted],
          ].map(([label, value]) => (
            <div key={label} className="border border-black/10 p-4">
              <p className="luxury-label mb-2 text-gray-muted">{label}</p>
              <p className="font-serif text-2xl">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Learning Insights</h3>
        {customer.learningInsights.length ? (
          <div className="space-y-4">
            {customer.learningInsights.map((insight) => (
              <div key={insight.id} className="border border-black/10 p-4">
                <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">
                  Day {insight.dayNumber} · {formatDateTime(insight.createdAt)}
                </p>
                <p className="mt-2 font-sans text-sm text-gray-mid">{insight.prompt}</p>
                <p className="mt-2 font-sans text-sm text-black">{insight.response}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-gray-mid">No learning insight responses yet.</p>
        )}
      </section>

      <section className="space-y-4 border border-black/10 p-6">
        <h3 className="font-serif text-2xl text-black">Email Delivery History</h3>
        {customer.emails.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/10">
              <thead>
                <tr className="text-left font-sans text-xs uppercase tracking-nav text-gray-muted">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {customer.emails.map((email) => (
                  <tr key={email.id}>
                    <td className="px-3 py-2 font-sans text-sm">{email.emailType}</td>
                    <td className="px-3 py-2 font-sans text-sm">{email.status}</td>
                    <td className="px-3 py-2 font-sans text-sm">
                      {formatDateTime(email.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-sans text-sm text-gray-mid">No emails recorded yet.</p>
        )}
      </section>
    </div>
  );
}

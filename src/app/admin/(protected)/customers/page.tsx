import { Suspense } from "react";
import Link from "next/link";
import { AdminCustomerFilters } from "@/components/admin/AdminCustomerFilters";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
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
import { getAdminCustomers } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminCustomerFilter, AdminCustomerRow } from "@/lib/admin/admin-types";

type CustomersPageProps = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    tag?: string;
    includeTestData?: string;
  }>;
};

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const filter = (params.filter as AdminCustomerFilter | undefined) ?? "all";
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const customers = await getAdminCustomers({
    query: params.q,
    filter,
    tag: params.tag,
    includeTestData,
  });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Plan Customers"
        title="Creator Plan Customers"
        description="Who are my customers, how are they progressing, and who needs attention — instantly."
        actions={
          <>
            <AdminExportLink
              href="/api/admin/export/customers"
              label="Customers CSV"
              includeTestData={includeTestData}
            />
            <AdminExportLink
              href="/api/admin/export/progress"
              label="Progress CSV"
              includeTestData={includeTestData}
            />
          </>
        }
      />

      <Suspense
        fallback={
          <div className="border border-black/10 p-4 text-sm text-gray-mid">Loading filters…</div>
        }
      >
        <AdminCustomerFilters />
      </Suspense>

      <AdminDataTable<AdminCustomerRow>
        rows={customers}
        emptyMessage="No customers yet."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <Link
                href={customerProfilePath(row.customerKey, includeTestData)}
                className="hover:underline"
              >
                {row.name}
                {row.totalPurchasesForEmail > 1 ? (
                  <span className="ml-2 font-sans text-xs text-gray-muted">
                    ({row.purchaseNumber}/{row.totalPurchasesForEmail})
                  </span>
                ) : null}
              </Link>
            ),
          },
          { key: "email", header: "Email", render: (row) => row.email },
          {
            key: "purchaseDate",
            header: "Purchase Date",
            render: (row) => formatDate(row.purchaseDate),
          },
          {
            key: "amount",
            header: "Amount Paid",
            render: (row) =>
              row.amountPaidCents != null ? formatCurrency(row.amountPaidCents) : "—",
          },
          {
            key: "day",
            header: "Current Day",
            render: (row) => (row.currentDay != null ? `Day ${row.currentDay}/40` : "—"),
          },
          {
            key: "progress",
            header: "Completion",
            render: (row) =>
              row.progressPercent != null ? formatPercent(row.progressPercent, 0) : "—",
          },
          {
            key: "lastActive",
            header: "Last Active",
            render: (row) => formatDateTime(row.lastActiveAt),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <AdminLifecycleBadge status={row.lifecycleStatus} />,
          },
          {
            key: "health",
            header: "Health",
            render: (row) => <AdminHealthBadge health={row.health} />,
          },
          {
            key: "tags",
            header: "Tags",
            render: (row) =>
              row.tags.length ? (
                <span className="font-sans text-xs text-gray-mid">{row.tags.join(" · ")}</span>
              ) : (
                "—"
              ),
          },
          {
            key: "score",
            header: "Assessment",
            render: (row) => (row.assessmentScore != null ? String(row.assessmentScore) : "—"),
          },
          {
            key: "source",
            header: "Source",
            render: (row) => <AdminSourceBadge source={row.source} />,
          },
        ]}
      />
    </div>
  );
}

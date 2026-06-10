import Link from "next/link";
import { Suspense } from "react";
import { AdminCustomerFilters } from "@/components/admin/AdminCustomerFilters";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
  searchParams: Promise<{ q?: string; filter?: string; includeTestData?: string }>;
};

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const filter = (params.filter as AdminCustomerFilter | undefined) ?? "all";
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const customers = await getAdminCustomers({ query: params.q, filter, includeTestData });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Customers"
        title="Customer Portfolio"
        description="Every paying customer with plan progress, login activity, and email delivery status."
        actions={
          <AdminExportLink
            href="/api/admin/export/customers"
            label="Export CSV"
            includeTestData={includeTestData}
          />
        }
      />

      <Suspense fallback={<div className="border border-black/10 p-4 text-sm text-gray-mid">Loading filters…</div>}>
        <AdminCustomerFilters />
      </Suspense>

      <AdminDataTable<AdminCustomerRow>
        rows={customers}
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
            header: "Amount",
            render: (row) =>
              row.amountPaidCents != null ? formatCurrency(row.amountPaidCents) : "—",
          },
          {
            key: "planStatus",
            header: "Plan Status",
            render: (row) => row.planStatus ?? "—",
          },
          {
            key: "progress",
            header: "Progress",
            render: (row) =>
              row.progressPercent != null ? formatPercent(row.progressPercent, 0) : "—",
          },
          {
            key: "day",
            header: "Current Day",
            render: (row) => (row.currentDay != null ? String(row.currentDay) : "—"),
          },
          {
            key: "login",
            header: "Last Login",
            render: (row) => formatDateTime(row.lastLogin),
          },
          {
            key: "emailStatus",
            header: "Email Status",
            render: (row) => row.emailStatus,
          },
        ]}
      />
    </div>
  );
}

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminMetricGrid } from "@/components/admin/AdminMetricGrid";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDateTime, formatPercent } from "@/lib/admin/admin-format";
import { getAdminEmailDeliveries, getAdminEmailStats } from "@/lib/admin/admin-repository";
import { parseIncludeTestData, withTestDataQuery } from "@/lib/admin/admin-test-data";
import type { EmailDeliveryRecord } from "@/lib/email/email-delivery-repository";

type EmailsPageProps = {
  searchParams: Promise<{ status?: string; includeTestData?: string }>;
};

export default async function AdminEmailsPage({ searchParams }: EmailsPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const statusFilter =
    params.status === "sent" || params.status === "failed" ? params.status : undefined;

  const [deliveries, stats] = await Promise.all([
    getAdminEmailDeliveries({ includeTestData, limit: 500, status: statusFilter }),
    getAdminEmailStats({ includeTestData }),
  ]);

  const total = stats.totalSent + stats.totalFailed;
  const deliveryRate = total > 0 ? (stats.totalSent / total) * 100 : 0;
  const failureRate = total > 0 ? (stats.totalFailed / total) * 100 : 0;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Email Center"
        title="Customer Communications"
        description="Delivery history from Resend via the email_deliveries table."
        actions={
          <AdminExportLink
            href="/api/admin/export/emails"
            label="Export Email Logs"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminMetricGrid
        metrics={[
          { label: "Total Sent", value: String(stats.totalSent) },
          { label: "Delivery Rate", value: formatPercent(deliveryRate, 1) },
          { label: "Failure Rate", value: formatPercent(failureRate, 1) },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {[
          { href: withTestDataQuery("/admin/emails", includeTestData), label: "All", active: !params.status },
          {
            href: withTestDataQuery("/admin/emails?status=sent", includeTestData),
            label: "Delivered",
            active: params.status === "sent",
          },
          {
            href: withTestDataQuery("/admin/emails?status=failed", includeTestData),
            label: "Failed",
            active: params.status === "failed",
          },
        ].map((filter) => (
          <a
            key={filter.href}
            href={filter.href}
            className={`border px-3 py-2 font-sans text-xs uppercase tracking-nav ${
              filter.active
                ? "border-black bg-black text-white"
                : "border-black/20 text-gray-mid hover:border-black"
            }`}
          >
            {filter.label}
          </a>
        ))}
      </div>

      <AdminDataTable<EmailDeliveryRecord>
        rows={deliveries}
        columns={[
          { key: "recipient", header: "Recipient", render: (row) => row.recipientEmail },
          { key: "type", header: "Email Type", render: (row) => row.emailType },
          { key: "status", header: "Status", render: (row) => row.status },
          {
            key: "sent",
            header: "Sent Date",
            render: (row) => formatDateTime(row.createdAt),
          },
          { key: "resend", header: "Resend ID", render: (row) => row.resendId ?? "—" },
          {
            key: "error",
            header: "Error Message",
            render: (row) => row.errorMessage ?? "—",
          },
        ]}
      />
    </div>
  );
}

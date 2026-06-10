import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminPartnerInquiries } from "@/lib/admin/crm-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminPartnerInquiryRow } from "@/lib/admin/admin-types";

const PARTNER_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "in_conversation", label: "In Conversation" },
  { value: "partnered", label: "Partnered" },
  { value: "not_fit", label: "Not Fit" },
] as const;

type PartnerCrmPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminPartnerCrmPage({ searchParams }: PartnerCrmPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const inquiries = await getAdminPartnerInquiries({ includeTestData });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Partner CRM"
        title="Partnership Inquiries"
        description="Partnership and creative partner inquiries stored in Ivara Hous alongside existing form automations."
        actions={
          <AdminExportLink
            href="/api/admin/export/partner-inquiries"
            label="Export CSV"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminDataTable<AdminPartnerInquiryRow>
        rows={inquiries}
        emptyMessage="No partner inquiries stored yet. New submissions will appear here going forward."
        columns={[
          { key: "company", header: "Company / Property", render: (row) => row.companyName },
          { key: "contact", header: "Contact Name", render: (row) => row.contactName },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "website", header: "Website", render: (row) => row.website ?? "—" },
          { key: "location", header: "Location", render: (row) => row.location ?? "—" },
          { key: "type", header: "Inquiry Type", render: (row) => row.inquiryType },
          {
            key: "submitted",
            header: "Date Submitted",
            render: (row) => formatDate(row.submittedAt),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusSelect
                recordType="partner"
                recordId={row.id}
                value={row.status}
                options={[...PARTNER_STATUSES]}
              />
            ),
          },
          { key: "notes", header: "Notes", render: (row) => row.notes ?? "—" },
          { key: "source", header: "Source", render: (row) => row.source },
        ]}
      />
    </div>
  );
}

import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminContactInquiries } from "@/lib/admin/crm-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminContactInquiryRow } from "@/lib/admin/admin-types";

const CONTACT_STATUSES = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

type ContactInquiriesPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminContactInquiriesPage({
  searchParams,
}: ContactInquiriesPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const inquiries = await getAdminContactInquiries({ includeTestData });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Contact Inquiries"
        title="General Contact Submissions"
        description="Contact form messages stored in Ivara Hous. Confirmation emails and team notifications remain unchanged."
        actions={
          <AdminExportLink
            href="/api/admin/export/contact-inquiries"
            label="Export CSV"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminDataTable<AdminContactInquiryRow>
        rows={inquiries}
        emptyMessage="No contact inquiries stored yet. New submissions will appear here going forward."
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "type", header: "Inquiry Type", render: (row) => row.inquiryType },
          { key: "subject", header: "Subject", render: (row) => row.subject },
          {
            key: "message",
            header: "Message",
            render: (row) => (
              <span className="line-clamp-2 max-w-xs" title={row.message}>
                {row.message}
              </span>
            ),
          },
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
                recordType="contact"
                recordId={row.id}
                value={row.status}
                options={[...CONTACT_STATUSES]}
              />
            ),
          },
          { key: "notes", header: "Notes", render: (row) => row.notes ?? "—" },
        ]}
      />
    </div>
  );
}

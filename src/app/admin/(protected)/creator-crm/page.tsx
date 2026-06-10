import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatusSelect } from "@/components/admin/AdminStatusSelect";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminCreatorApplications } from "@/lib/admin/crm-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminCreatorApplicationRow } from "@/lib/admin/admin-types";

const CREATOR_STATUSES = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "approved", label: "Approved" },
  { value: "declined", label: "Declined" },
  { value: "follow_up", label: "Follow Up" },
] as const;

type CreatorCrmPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminCreatorCrmPage({ searchParams }: CreatorCrmPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const applications = await getAdminCreatorApplications({ includeTestData });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Creator CRM"
        title="Creator Applications"
        description="Creator roster applications stored in Ivara Hous. Make/Notion automation remains unchanged for new submissions."
        actions={
          <AdminExportLink
            href="/api/admin/export/creator-applications"
            label="Export CSV"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminDataTable<AdminCreatorApplicationRow>
        rows={applications}
        emptyMessage="No creator applications stored yet. New submissions will appear here going forward."
        columns={[
          { key: "name", header: "Name", render: (row) => row.name },
          { key: "email", header: "Email", render: (row) => row.email },
          { key: "instagram", header: "Instagram", render: (row) => row.instagram ?? "—" },
          { key: "niche", header: "Niche", render: (row) => row.niche ?? "—" },
          { key: "location", header: "Location", render: (row) => row.location ?? "—" },
          {
            key: "submitted",
            header: "Application Date",
            render: (row) => formatDate(row.submittedAt),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <AdminStatusSelect
                recordType="creator"
                recordId={row.id}
                value={row.status}
                options={[...CREATOR_STATUSES]}
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

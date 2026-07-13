import Link from "next/link";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminExportLink } from "@/components/admin/AdminExportLink";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminAssessments } from "@/lib/admin/admin-repository";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminAssessmentRow } from "@/lib/admin/admin-types";

type AdminAssessmentsPageProps = {
  searchParams: Promise<{ includeTestData?: string }>;
};

export default async function AdminAssessmentsPage({ searchParams }: AdminAssessmentsPageProps) {
  const params = await searchParams;
  const includeTestData = parseIncludeTestData(params.includeTestData);
  const assessments = await getAdminAssessments({ includeTestData });

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Assessments"
        title="Creator Development Assessments"
        description="Every assessment submission with payment status and creator stage."
        actions={
          <AdminExportLink
            href="/api/admin/export/assessments"
            label="Export CSV"
            includeTestData={includeTestData}
          />
        }
      />

      <AdminDataTable<AdminAssessmentRow>
        rows={assessments}
        emptyMessage="No assessments available yet."
        columns={[
          {
            key: "name",
            header: "Name",
            render: (row) => (
              <Link href={`/admin/assessments/${row.id}`} className="hover:underline">
                {row.name}
              </Link>
            ),
          },
          { key: "email", header: "Email", render: (row) => row.email },
          {
            key: "date",
            header: "Date",
            render: (row) => formatDate(row.submittedAt),
          },
          { key: "stage", header: "Creator Stage", render: (row) => row.creatorStage },
          {
            key: "paid",
            header: "Paid / Unpaid",
            render: (row) => (row.paymentStatus === "paid" ? "Paid" : "Unpaid"),
          },
        ]}
      />
    </div>
  );
}

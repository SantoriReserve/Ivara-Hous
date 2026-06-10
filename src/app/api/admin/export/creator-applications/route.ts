import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminCreatorApplications } from "@/lib/admin/crm-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const rows = await getAdminCreatorApplications(options);

  return csvResponse(
    "ivara-hous-creator-applications.csv",
    [
      "Name",
      "Email",
      "Instagram",
      "Niche",
      "Location",
      "Application Date",
      "Status",
      "Notes",
      "Source",
    ],
    rows.map((row) => [
      row.name,
      row.email,
      row.instagram ?? "",
      row.niche ?? "",
      row.location ?? "",
      formatDate(row.submittedAt),
      row.status,
      row.notes ?? "",
      row.source,
    ])
  );
}

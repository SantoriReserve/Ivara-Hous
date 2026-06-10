import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminPartnerInquiries } from "@/lib/admin/crm-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const rows = await getAdminPartnerInquiries(options);

  return csvResponse(
    "ivara-hous-partner-inquiries.csv",
    [
      "Company / Property",
      "Contact Name",
      "Email",
      "Website",
      "Location",
      "Inquiry Type",
      "Date Submitted",
      "Status",
      "Notes",
      "Source",
    ],
    rows.map((row) => [
      row.companyName,
      row.contactName,
      row.email,
      row.website ?? "",
      row.location ?? "",
      row.inquiryType,
      formatDate(row.submittedAt),
      row.status,
      row.notes ?? "",
      row.source,
    ])
  );
}

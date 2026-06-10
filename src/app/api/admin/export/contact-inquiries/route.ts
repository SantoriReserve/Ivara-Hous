import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { formatDate } from "@/lib/admin/admin-format";
import { getAdminContactInquiries } from "@/lib/admin/crm-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const rows = await getAdminContactInquiries(options);

  return csvResponse(
    "ivara-hous-contact-inquiries.csv",
    [
      "Name",
      "Email",
      "Inquiry Type",
      "Subject",
      "Message",
      "Date Submitted",
      "Status",
      "Notes",
    ],
    rows.map((row) => [
      row.name,
      row.email,
      row.inquiryType,
      row.subject,
      row.message,
      formatDate(row.submittedAt),
      row.status,
      row.notes ?? "",
    ])
  );
}

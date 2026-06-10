import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { getAdminAssessmentsForExport } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const assessments = await getAdminAssessmentsForExport(options);
  return csvResponse(
    "ivara-hous-assessments.csv",
    ["ID", "Name", "Email", "Submitted At", "Payment Status", "Creator Stage"],
    assessments.map((row) => [
      row.id,
      row.full_name,
      row.email,
      row.submitted_at,
      row.payment_status,
      (row.analysis as { preview?: { currentCreatorStage?: string } })?.preview
        ?.currentCreatorStage ?? "",
    ])
  );
}

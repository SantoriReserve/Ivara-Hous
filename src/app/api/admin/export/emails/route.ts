import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { getAdminEmailDeliveries } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const deliveries = await getAdminEmailDeliveries({ ...options, limit: 5000 });
  return csvResponse(
    "ivara-hous-email-deliveries.csv",
    [
      "Recipient",
      "Email Type",
      "Status",
      "Sent Date",
      "Resend ID",
      "Error Message",
      "Purchase ID",
      "Plan Instance ID",
    ],
    deliveries.map((row) => [
      row.recipientEmail,
      row.emailType,
      row.status,
      row.createdAt,
      row.resendId ?? "",
      row.errorMessage ?? "",
      row.purchaseId ?? "",
      row.planInstanceId ?? "",
    ])
  );
}

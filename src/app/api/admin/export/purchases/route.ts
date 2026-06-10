import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { getAdminPurchasesForExport } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const purchases = await getAdminPurchasesForExport(options);
  return csvResponse(
    "ivara-hous-purchases.csv",
    [
      "Purchase ID",
      "Customer Email",
      "Amount Cents",
      "Currency",
      "Status",
      "Purchased At",
      "User ID",
      "Assessment ID",
    ],
    purchases.map((row) => [
      row.id,
      row.customer_email,
      row.amount_cents,
      row.currency,
      row.status,
      row.purchased_at,
      row.user_id ?? "",
      row.assessment_id ?? "",
    ])
  );
}

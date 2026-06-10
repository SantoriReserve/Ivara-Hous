import {
  adminQueryOptionsFromRequest,
  csvResponse,
  requireAdminExportAccess,
} from "@/lib/admin/admin-export";
import { formatCurrency, formatDate, formatPercent } from "@/lib/admin/admin-format";
import { getAdminCustomers } from "@/lib/admin/admin-repository";

export async function GET(request: Request) {
  const denied = await requireAdminExportAccess();
  if (denied) {
    return denied;
  }

  const options = adminQueryOptionsFromRequest(request);
  const customers = await getAdminCustomers(options);
  return csvResponse(
    "ivara-hous-customers.csv",
    [
      "Name",
      "Email",
      "Purchase Date",
      "Amount Paid",
      "Plan Status",
      "Progress %",
      "Current Day",
      "Last Login",
      "Email Status",
    ],
    customers.map((row) => [
      row.name,
      row.email,
      formatDate(row.purchaseDate),
      row.amountPaidCents != null ? formatCurrency(row.amountPaidCents) : "",
      row.planStatus ?? "",
      row.progressPercent != null ? formatPercent(row.progressPercent, 0) : "",
      row.currentDay ?? "",
      row.lastLogin ?? "",
      row.emailStatus,
      row.purchaseNumber,
      row.totalPurchasesForEmail,
    ])
  );
}

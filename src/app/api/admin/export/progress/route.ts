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
  const url = new URL(request.url);
  const tag = url.searchParams.get("tag") ?? undefined;
  const customers = await getAdminCustomers({ ...options, tag });

  return csvResponse(
    "ivara-hous-customer-progress.csv",
    [
      "Name",
      "Email",
      "Product",
      "Purchase Date",
      "Amount Paid",
      "Current Day",
      "Completion %",
      "Status",
      "Health",
      "Last Active",
      "Tags",
      "Source",
    ],
    customers.map((row) => [
      row.name,
      row.email,
      row.productSlug,
      formatDate(row.purchaseDate),
      row.amountPaidCents != null ? formatCurrency(row.amountPaidCents) : "",
      row.currentDay ?? "",
      row.progressPercent != null ? formatPercent(row.progressPercent, 0) : "",
      row.lifecycleStatus,
      row.health,
      row.lastActiveAt ?? "",
      row.tags.join(" | "),
      row.source,
    ])
  );
}

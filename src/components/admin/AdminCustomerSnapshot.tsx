import {
  AdminHealthBadge,
} from "@/components/admin/AdminStatusBadges";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/admin/admin-format";
import type { AdminCustomerSnapshot } from "@/lib/admin/admin-types";

export function AdminCustomerSnapshot({ snapshot }: { snapshot: AdminCustomerSnapshot }) {
  const tiles: Array<[string, string]> = [
    ["Current Stage", snapshot.currentStage ?? "—"],
    [
      "Days Since Purchase",
      snapshot.daysSincePurchase != null ? String(snapshot.daysSincePurchase) : "—",
    ],
    [
      "Days Since Last Login",
      snapshot.daysSinceLastLogin != null ? String(snapshot.daysSinceLastLogin) : "Never",
    ],
    ["Lifetime Value", formatCurrency(snapshot.lifetimeValueCents)],
    [
      "Current Day",
      snapshot.currentDay != null ? `Day ${snapshot.currentDay}/40` : "—",
    ],
    [
      "Completion",
      snapshot.completionPercent != null
        ? formatPercent(snapshot.completionPercent, 0)
        : "—",
    ],
    ["Last Completed Task", snapshot.lastCompletedTask ?? "—"],
    ["Product", snapshot.productName],
  ];

  return (
    <section className="space-y-6 border border-black/10 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="luxury-label mb-2 text-gray-muted">Customer Snapshot</p>
          <h3 className="font-serif text-2xl text-black">At a Glance</h3>
        </div>
        <AdminHealthBadge health={snapshot.health} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="border border-black/10 p-4">
            <p className="luxury-label mb-2 text-gray-muted">{label}</p>
            <p className="font-sans text-sm text-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="border border-black/10 bg-black/[0.02] p-5">
        <p className="luxury-label mb-2 text-gray-muted">Next Recommended Action</p>
        <p className="font-serif text-xl text-black">{snapshot.nextRecommendedAction}</p>
      </div>
    </section>
  );
}

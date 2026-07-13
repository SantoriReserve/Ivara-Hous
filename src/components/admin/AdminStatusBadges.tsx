import {
  healthLabel,
  lifecycleLabel,
  sourceLabel,
  type CustomerHealth,
  type CustomerLifecycleStatus,
  type CustomerAcquisitionSource,
} from "@/lib/admin/customer-health";

export function AdminHealthBadge({ health }: { health: CustomerHealth }) {
  const mark =
    health === "on_track" ? "●" : health === "needs_attention" ? "●" : "●";
  const color =
    health === "on_track"
      ? "text-emerald-700"
      : health === "needs_attention"
        ? "text-amber-700"
        : "text-red-700";

  return (
    <span className={`inline-flex items-center gap-1.5 font-sans text-sm ${color}`}>
      <span aria-hidden>{mark}</span>
      {healthLabel(health)}
    </span>
  );
}

export function AdminLifecycleBadge({ status }: { status: CustomerLifecycleStatus }) {
  return (
    <span className="font-sans text-sm text-black">{lifecycleLabel(status)}</span>
  );
}

export function AdminSourceBadge({ source }: { source: CustomerAcquisitionSource }) {
  return <span className="font-sans text-sm text-gray-mid">{sourceLabel(source)}</span>;
}

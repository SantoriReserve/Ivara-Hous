import type { AdminDistributionBucket } from "@/lib/admin/admin-types";

export function AdminDistributionChart({
  title,
  data,
}: {
  title: string;
  data: AdminDistributionBucket[];
}) {
  const max = Math.max(...data.map((bucket) => bucket.count), 1);

  return (
    <div className="border border-black/10 p-6">
      <p className="luxury-label mb-4 text-gray-muted">{title}</p>
      <div className="space-y-3">
        {data.map((bucket) => (
          <div key={bucket.label}>
            <div className="mb-1 flex items-center justify-between font-sans text-xs text-gray-mid">
              <span>{bucket.label}</span>
              <span>{bucket.count}</span>
            </div>
            <div className="h-2 bg-black/5">
              <div
                className="h-full bg-black"
                style={{ width: `${(bucket.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

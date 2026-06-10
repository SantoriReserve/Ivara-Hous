type AdminMetric = {
  label: string;
  value: string;
  detail?: string;
};

export function AdminMetricGrid({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {metrics.map((metric) => (
        <div key={metric.label} className="border border-black/10 p-5">
          <p className="luxury-label mb-2 text-gray-muted">{metric.label}</p>
          <p className="font-serif text-2xl text-black">{metric.value}</p>
          {metric.detail ? (
            <p className="mt-2 font-sans text-xs text-gray-mid">{metric.detail}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

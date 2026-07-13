type AdminMetric = {
  label: string;
  value: string;
  detail?: string;
  href?: string;
};

export function AdminMetricGrid({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {metrics.map((metric) => {
        const content = (
          <>
            <p className="luxury-label mb-2 text-gray-muted">{metric.label}</p>
            <p className="font-serif text-2xl text-black">{metric.value}</p>
            {metric.detail ? (
              <p className="mt-2 font-sans text-xs text-gray-mid">{metric.detail}</p>
            ) : null}
            {metric.href ? (
              <p className="mt-3 font-sans text-[10px] uppercase tracking-nav text-gray-muted">
                View details →
              </p>
            ) : null}
          </>
        );

        if (metric.href) {
          return (
            <a
              key={metric.label}
              href={metric.href}
              className="border border-black/10 p-5 transition-colors hover:border-black hover:bg-black/[0.02]"
            >
              {content}
            </a>
          );
        }

        return (
          <div key={metric.label} className="border border-black/10 p-5">
            {content}
          </div>
        );
      })}
    </div>
  );
}

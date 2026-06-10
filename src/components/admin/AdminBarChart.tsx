import type { AdminTimeSeriesPoint } from "@/lib/admin/admin-types";

type AdminBarChartProps = {
  title: string;
  data: AdminTimeSeriesPoint[];
  valueFormatter?: (value: number) => string;
  labelMode?: "daily" | "monthly";
  maxBars?: number;
};

function formatDailyLabel(date: string): string {
  const [, month, day] = date.split("-");
  return `${month}/${day}`;
}

function formatMonthlyLabel(date: string): string {
  const [year, month] = date.split("-");
  const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", {
    month: "short",
  });
  return `${monthName} '${year.slice(-2)}`;
}

export function AdminBarChart({
  title,
  data,
  valueFormatter = (value) => String(value),
  labelMode = "daily",
  maxBars = 30,
}: AdminBarChartProps) {
  const visibleData = data.slice(-maxBars);
  const max = Math.max(...visibleData.map((point) => point.value), 1);
  const chartHeight = 160;
  const labelEvery =
    labelMode === "monthly" ? 1 : Math.max(1, Math.ceil(visibleData.length / 6));

  return (
    <div className="border border-black/10 p-6">
      <p className="luxury-label mb-4 text-gray-muted">{title}</p>
      <div className="overflow-x-auto">
        <div
          className="flex min-w-full items-end gap-1.5"
          style={{ minHeight: chartHeight + 28 }}
        >
          {visibleData.map((point, index) => {
            const barHeight =
              point.value > 0 ? Math.max(Math.round((point.value / max) * chartHeight), 4) : 0;
            const showLabel = index % labelEvery === 0 || index === visibleData.length - 1;

            return (
              <div
                key={`${point.date}-${index}`}
                className="flex min-w-[18px] flex-1 flex-col items-center justify-end gap-2"
                title={`${point.date}: ${valueFormatter(point.value)}`}
              >
                <div
                  className={`w-full ${point.value > 0 ? "bg-black" : "bg-black/10"}`}
                  style={{ height: barHeight }}
                />
                {showLabel ? (
                  <span className="whitespace-nowrap font-sans text-[10px] leading-none text-gray-muted">
                    {labelMode === "monthly"
                      ? formatMonthlyLabel(point.date)
                      : formatDailyLabel(point.date)}
                  </span>
                ) : (
                  <span className="h-3" aria-hidden />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

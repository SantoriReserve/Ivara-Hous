export function AdminDayProgressTracker({
  currentDay,
  totalDays = 40,
}: {
  currentDay: number | null;
  totalDays?: number;
}) {
  const filled = Math.max(0, Math.min(totalDays, currentDay ?? 0));

  return (
    <section className="border border-black/10 p-6">
      <p className="luxury-label mb-2 text-gray-muted">Progress Visualization</p>
      <h3 className="font-serif text-2xl text-black">
        {currentDay != null ? `Day ${currentDay} of ${totalDays}` : "Not started"}
      </h3>
      <div
        className="mt-5 flex flex-wrap gap-1"
        aria-label={`${filled} of ${totalDays} days complete`}
      >
        {Array.from({ length: totalDays }, (_, index) => {
          const active = index < filled;
          return (
            <span
              key={index}
              className={`inline-block h-3 w-3 ${active ? "bg-black" : "bg-black/10"}`}
              title={`Day ${index + 1}`}
            />
          );
        })}
      </div>
      <p className="mt-4 font-sans text-xs uppercase tracking-nav text-gray-muted">
        {filled}/{totalDays} days reached
      </p>
    </section>
  );
}

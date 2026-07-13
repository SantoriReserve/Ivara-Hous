export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-black/10" />
        <div className="h-8 w-64 bg-black/10" />
        <div className="h-4 w-full max-w-xl bg-black/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-28 border border-black/10 bg-black/[0.02]" />
        ))}
      </div>
      <div className="h-48 border border-black/10 bg-black/[0.02]" />
    </div>
  );
}

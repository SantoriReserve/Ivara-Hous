export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="border border-black/10 px-6 py-10 text-center">
      <p className="font-serif text-xl text-black">{title}</p>
      {description ? (
        <p className="mt-2 font-sans text-sm text-gray-mid">{description}</p>
      ) : null}
    </div>
  );
}

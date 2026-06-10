type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-black/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="luxury-label mb-3 text-gray-muted">{eyebrow}</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

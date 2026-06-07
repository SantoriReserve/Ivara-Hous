import Link from "next/link";

type DashboardCardProps = {
  label: string;
  title: string;
  description: string;
  href?: string;
  meta?: string;
  children?: React.ReactNode;
};

export function DashboardCard({
  label,
  title,
  description,
  href,
  meta,
  children,
}: DashboardCardProps) {
  const content = (
    <div className="group flex h-full flex-col border border-black/10 bg-white p-6 transition-colors hover:border-black/25">
      <p className="luxury-label mb-2 text-gray-muted">{label}</p>
      <h3 className="font-serif text-xl font-normal tracking-tight text-black">{title}</h3>
      <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-gray-mid">{description}</p>
      {meta && (
        <p className="mt-4 font-sans text-xs uppercase tracking-nav text-gray-muted">{meta}</p>
      )}
      {children}
      {href && (
        <span className="mt-4 font-sans text-xs uppercase tracking-nav text-black group-hover:opacity-60">
          Open →
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}

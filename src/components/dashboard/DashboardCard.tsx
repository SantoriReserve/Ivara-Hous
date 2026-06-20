import Link from "next/link";
import Image from "next/image";

type DashboardCardProps = {
  label: string;
  title: string;
  description: string;
  href?: string;
  meta?: string;
  imageSrc?: string;
  imagePosition?: string;
  children?: React.ReactNode;
};

export function DashboardCard({
  label,
  title,
  description,
  href,
  meta,
  imageSrc,
  imagePosition = "center center",
  children,
}: DashboardCardProps) {
  const content = (
    <div className="group flex h-full flex-col overflow-hidden border border-black/10 bg-white transition-all duration-luxury ease-luxury hover:border-black/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      {imageSrc && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover transition-transform duration-luxury ease-luxury group-hover:scale-[1.03]"
            style={{ objectPosition: imagePosition }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="luxury-label mb-2 text-gray-muted">{label}</p>
        <h3 className="font-serif text-xl font-normal tracking-tight text-black sm:text-2xl">
          {title}
        </h3>
        <p className="mt-3 flex-1 font-sans text-sm leading-relaxed text-gray-mid">{description}</p>
        {meta && (
          <p className="mt-5 font-sans text-xs uppercase tracking-nav text-gray-muted">{meta}</p>
        )}
        {children}
        {href && (
          <span className="mt-5 font-sans text-xs uppercase tracking-nav text-black group-hover:opacity-60">
            Open →
          </span>
        )}
      </div>
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

import { type ReactNode } from "react";

type PageHeroProps = {
  label?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  dark?: boolean;
};

export function PageHero({
  label,
  title,
  description,
  children,
  dark = false,
}: PageHeroProps) {
  return (
    <section
      className={`border-b border-black/10 py-20 sm:py-28 lg:py-32 ${
        dark ? "bg-black text-white" : "bg-white text-black"
      }`}
    >
      <div className="luxury-container">
        {label && (
          <p className={`luxury-label mb-6 ${dark ? "text-white/50" : ""}`}>
            {label}
          </p>
        )}
        <h1 className="luxury-heading max-w-4xl text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
          {title}
        </h1>
        {description && (
          <p
            className={`mt-8 max-w-prose text-base leading-[1.85] sm:text-lg ${
              dark ? "text-white/65" : "text-gray-mid"
            }`}
          >
            {description}
          </p>
        )}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}

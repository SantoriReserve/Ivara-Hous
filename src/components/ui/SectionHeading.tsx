type SectionHeadingProps = {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  size?: "default" | "large";
  inverted?: boolean;
};

export function SectionHeading({
  label,
  title,
  description,
  align = "left",
  className = "",
  size = "default",
  inverted = false,
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const titleSize =
    size === "large"
      ? "text-4xl sm:text-5xl lg:text-6xl"
      : "text-3xl sm:text-4xl lg:text-[2.75rem]";

  return (
    <div className={`max-w-prose ${alignClass} ${className}`}>
      {label && (
        <p className={`luxury-label mb-5 ${inverted ? "text-white/50" : ""}`}>
          {label}
        </p>
      )}
      <h2
        className={`luxury-heading ${titleSize} ${inverted ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-8 max-w-prose text-base leading-[1.85] sm:text-lg ${
            inverted ? "text-white/65" : "text-gray-mid"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

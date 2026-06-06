import Link from "next/link";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-black text-white hover:bg-black/90 border border-black",
  secondary:
    "bg-white text-black hover:bg-gray-light border border-black",
  outline:
    "bg-transparent text-black hover:bg-black hover:text-white border border-black",
  ghost:
    "bg-transparent text-black hover:text-gray-mid border border-transparent underline-offset-[6px] hover:underline",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-6 py-2.5 text-[10px] tracking-nav uppercase",
  md: "px-9 py-3.5 text-[11px] tracking-luxury uppercase",
  lg: "px-12 py-4 text-[11px] tracking-luxury uppercase",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
  external?: boolean;
};

type ButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
    external?: never;
  };

type LinkButtonProps = BaseProps & {
  href: string;
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  href,
  external,
  ...props
}: ButtonProps | LinkButtonProps) {
  const classes = `inline-flex shrink-0 items-center justify-center whitespace-nowrap font-sans font-medium transition-all duration-luxury ease-luxury ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = props as ButtonProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

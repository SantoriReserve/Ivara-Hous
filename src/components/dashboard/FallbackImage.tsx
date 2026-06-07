"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";

type FallbackImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  sizes?: string;
  aspectClassName?: string;
  children?: ReactNode;
};

export function FallbackImage({
  src,
  fallbackSrc,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 100vw, 50vw",
  aspectClassName = "relative aspect-[16/10] w-full bg-black/5",
  children,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <div className={aspectClassName}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        onError={() => {
          if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
        }}
      />
      {children}
    </div>
  );
}

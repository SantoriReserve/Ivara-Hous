"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { isExternalImageUrl } from "@/lib/dashboard/partnership-property-images";

type FallbackImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
  objectPosition?: string;
  sizes?: string;
  aspectClassName?: string;
  children?: ReactNode;
};

export function FallbackImage({
  src,
  fallbackSrc,
  alt,
  className = "object-cover transition-transform duration-luxury ease-luxury group-hover:scale-[1.03]",
  objectPosition = "center center",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px",
  aspectClassName = "relative aspect-[4/3] w-full overflow-hidden bg-black/5",
  children,
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const unoptimized = isExternalImageUrl(imgSrc);

  return (
    <div className={`group ${aspectClassName}`}>
      <Image
        src={imgSrc}
        alt={alt}
        fill
        unoptimized={unoptimized}
        className={className}
        style={{ objectPosition }}
        sizes={sizes}
        onError={() => {
          if (imgSrc !== fallbackSrc) setImgSrc(fallbackSrc);
        }}
      />
      {children}
    </div>
  );
}

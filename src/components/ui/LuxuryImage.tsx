import Image from "next/image";
import type { ImageAsset } from "@/lib/images";

export type ImageAspectRatio =
  | "square"
  | "video"
  | "portrait"
  | "wide"
  | "hero"
  | "fill";

const aspectClasses: Record<ImageAspectRatio, string> = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9] max-h-[28rem] sm:max-h-[32rem]",
  hero: "aspect-[4/5] sm:aspect-[16/10]",
  fill: "h-full min-h-full w-full",
};

const sizesByAspect: Record<ImageAspectRatio, string> = {
  hero: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 640px",
  fill: "(max-width: 1024px) 100vw, 50vw",
  wide: "(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1200px",
  portrait: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px",
  video: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px",
  square: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px",
};

type LuxuryImageProps = {
  image: ImageAsset;
  aspectRatio?: ImageAspectRatio;
  className?: string;
  priority?: boolean;
  quality?: number;
  dimmed?: boolean;
};

export function LuxuryImage({
  image,
  aspectRatio = "video",
  className = "",
  priority = false,
  quality = 88,
  dimmed = false,
}: LuxuryImageProps) {
  const objectPosition = image.objectPosition ?? "center center";
  const isFill = aspectRatio === "fill";

  return (
    <div
      className={`relative overflow-hidden bg-black ${
        isFill ? aspectClasses.fill : aspectClasses[aspectRatio]
      } ${className}`}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizesByAspect[aspectRatio]}
        quality={quality}
        priority={priority}
        className={`object-cover ${dimmed ? "brightness-[0.72] contrast-[1.04]" : ""}`}
        style={{ objectPosition }}
      />
    </div>
  );
}

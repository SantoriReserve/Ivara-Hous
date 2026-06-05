export type ImageAsset = {
  src: string;
  alt: string;
  objectPosition?: string;
};

/** Curated luxury travel photography — paths under /public/images */
export const SITE_IMAGES = {
  hero: {
    src: "/images/hero-yacht-aerial.jpeg",
    alt: "Luxury yacht cruising through deep blue waters",
    objectPosition: "center 44%",
  },
  about: {
    src: "/images/about-resort-lounge.jpeg",
    alt: "Luxury resort pool lounge with pale blue umbrellas and daybeds",
    objectPosition: "center center",
  },
  aboutEditorial: {
    src: "/images/about-editorial-travel.jpeg",
    alt: "Editorial luxury travel moment at an exclusive destination",
    objectPosition: "center center",
  },
  assessment: {
    src: "/images/assessment-infinity-pool.jpeg",
    alt: "Woman overlooking the ocean from an infinity pool at a luxury property",
    objectPosition: "center 35%",
  },
  partnerAirelles: {
    src: "/images/partner-airelles-pool.jpeg",
    alt: "Airelles luxury poolside cocktails and editorial hospitality styling",
    objectPosition: "center center",
  },
  partnerVilla: {
    src: "/images/partner-luxury-villa.jpeg",
    alt: "Luxury villa and resort architecture in an exclusive setting",
    objectPosition: "center center",
  },
  creatorYacht: {
    src: "/images/creator-yacht-editorial.jpeg",
    alt: "Black and white editorial photograph on a luxury yacht deck",
    objectPosition: "center center",
  },
  creatorLifestyle: {
    src: "/images/creator-pool-lifestyle.jpeg",
    alt: "Overhead lifestyle scene of luxury poolside content and editorial details",
    objectPosition: "center center",
  },
  travelCoordination: {
    src: "/images/travel-coordination-hero.jpeg",
    alt: "Luxury travel coordination at an exclusive coastal destination",
    objectPosition: "center 30%",
  },
} as const satisfies Record<string, ImageAsset>;

export const SERVICE_IMAGES: Record<string, ImageAsset> = {
  "creator-campaigns": {
    src: "/images/service-creator-campaigns.jpeg",
    alt: "Creator campaign at a luxury coastal destination",
    objectPosition: "center 40%",
  },
  "creator-partnership-management": {
    src: "/images/service-partnership-management.jpeg",
    alt: "Ongoing creator partnership at a luxury hospitality property",
    objectPosition: "center center",
  },
  "luxury-travel-coordination": {
    src: "/images/service-travel-coordination.jpeg",
    alt: "Luxury travel coordination and elevated itinerary planning",
    objectPosition: "center center",
  },
  "hospitality-growth-partner": {
    src: "/images/service-hospitality-growth.jpeg",
    alt: "Hospitality growth partnership at a premium luxury property",
    objectPosition: "center center",
  },
  "content-creative-partnerships": {
    src: "/images/service-creative-partnerships.jpeg",
    alt: "Creative production and visual storytelling for luxury travel brands",
    objectPosition: "center center",
  },
  "creator-development": {
    src: "/images/service-creator-development.jpeg",
    alt: "Creator development and portfolio growth in luxury travel",
    objectPosition: "center 35%",
  },
};

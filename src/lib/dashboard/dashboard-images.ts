/**
 * Curated Ivara Hous editorial photography for the creator dashboard.
 * All assets live under /public/images — no generic stock URLs.
 */

export type DashboardImageAsset = {
  src: string;
  objectPosition?: string;
};

/** Premium editorial library — luxury travel, hospitality, creators */
export const DASHBOARD_EDITORIAL_POOL: DashboardImageAsset[] = [
  { src: "/images/hero-yacht-aerial.jpeg", objectPosition: "center 44%" },
  { src: "/images/about-resort-lounge.jpeg", objectPosition: "center center" },
  { src: "/images/about-editorial-travel.jpeg", objectPosition: "center center" },
  { src: "/images/assessment-infinity-pool.jpeg", objectPosition: "center 35%" },
  { src: "/images/creator-pool-lifestyle.jpeg", objectPosition: "center center" },
  { src: "/images/creator-yacht-editorial.jpeg", objectPosition: "center center" },
  { src: "/images/partner-airelles-pool.jpeg", objectPosition: "center center" },
  { src: "/images/partner-luxury-villa.jpeg", objectPosition: "center center" },
  { src: "/images/travel-coordination-hero.jpeg", objectPosition: "center 30%" },
  { src: "/images/service-creator-development.jpeg", objectPosition: "center 35%" },
  { src: "/images/service-creator-campaigns.jpeg", objectPosition: "center 40%" },
  { src: "/images/service-partnership-management.jpeg", objectPosition: "center center" },
  { src: "/images/service-hospitality-growth.jpeg", objectPosition: "center center" },
  { src: "/images/service-luxury-retreat.jpeg", objectPosition: "center center" },
  { src: "/images/service-travel-coordination.jpeg", objectPosition: "center center" },
  { src: "/images/service-creative-partnerships.jpeg", objectPosition: "center center" },
];

export const DASHBOARD_IMAGE_FALLBACK = DASHBOARD_EDITORIAL_POOL[0].src;

/** Known properties mapped to the closest curated editorial asset */
export const PROPERTY_IMAGE_OVERRIDES: Record<string, string> = {
  "miami-faena": "/images/service-hospitality-growth.jpeg",
  "la-beverly-hills-hotel": "/images/partner-luxury-villa.jpeg",
  "miami-standard": "/images/service-luxury-retreat.jpeg",
  "miami-1-hotel": "/images/about-resort-lounge.jpeg",
  "nyc-bowery": "/images/about-editorial-travel.jpeg",
  "nyc-standard-highline": "/images/service-luxury-retreat.jpeg",
  "la-proper-dtla": "/images/service-creator-campaigns.jpeg",
  "la-santa-monica-proper": "/images/travel-coordination-hero.jpeg",
  "paris-rosewood": "/images/partner-luxury-villa.jpeg",
  "paris-le-bristol": "/images/partner-airelles-pool.jpeg",
  "paris-shangri-la": "/images/about-resort-lounge.jpeg",
  "london-connaught": "/images/partner-luxury-villa.jpeg",
  "london-rosewood": "/images/service-hospitality-growth.jpeg",
  "london-chiltern": "/images/about-editorial-travel.jpeg",
  "ba-faena": "/images/service-hospitality-growth.jpeg",
  "ad-rosewood": "/images/partner-luxury-villa.jpeg",
};

const CATEGORY_POOL_KEYS: Record<string, number[]> = {
  "Boutique Hotel": [0, 1, 3, 6, 7, 12],
  "Small Luxury Hotel": [1, 6, 7, 12, 13],
  "Local Boutique Hotels": [1, 3, 6, 9],
  Resort: [1, 3, 13, 14],
  "Villa Retreat": [7, 0, 14],
  "Luxury Villa": [7, 0, 14],
  Restaurant: [2, 4, 15],
  "Local Dining Partners": [2, 4, 15],
  "Restaurant & Hotel": [2, 6, 12],
  "Restaurant & Experience": [2, 4, 10],
  Café: [4, 2, 15],
  "Café UGC": [4, 2, 15],
  "Wellness Hotel": [13, 3, 1],
  "Boutique Hotel & Spa": [13, 3, 6],
  "Sustainable Luxury Hotel": [13, 1, 12],
  "Luxury Hotel": [6, 7, 12, 1],
  "Luxury Hotel Group": [6, 7, 12],
  "Luxury Experiences": [0, 5, 8, 14],
  "Hospitality Brand": [12, 10, 11],
  "Hospitality Experience": [8, 14, 2],
  "Tourism Brand": [8, 14, 2],
  default: [1, 3, 6, 9, 12],
};

const CONTENT_FORMAT_POOL_KEYS: Record<string, number[]> = {
  Reel: [5, 4, 9, 0],
  TikTok: [5, 4, 9],
  Photo: [2, 3, 6],
  Carousel: [1, 3, 4],
  "Story Series": [4, 3, 15],
  Campaign: [10, 11, 12],
  Portfolio: [2, 9, 6],
  UGC: [4, 15, 6],
  "Talking-head": [2, 9, 5],
  Review: [6, 12, 2],
  Educational: [9, 11, 2],
  default: [2, 4, 9, 3],
};

const HUB_CARD_IMAGES: Record<string, string> = {
  today: "/images/assessment-infinity-pool.jpeg",
  pitch: "/images/service-partnership-management.jpeg",
  partnerships: "/images/partner-airelles-pool.jpeg",
  content: "/images/creator-pool-lifestyle.jpeg",
  resources: "/images/service-creative-partnerships.jpeg",
  wins: "/images/creator-yacht-editorial.jpeg",
};

const RESOURCE_IMAGES: Record<string, string> = {
  "media-kit": "/images/service-creator-development.jpeg",
  "outreach-tracker": "/images/service-partnership-management.jpeg",
  "partnership-tracker": "/images/partner-airelles-pool.jpeg",
  "content-planning": "/images/creator-pool-lifestyle.jpeg",
  "rate-card": "/images/service-hospitality-growth.jpeg",
  "portfolio-checklist": "/images/about-editorial-travel.jpeg",
  portfolio: "/images/service-creator-campaigns.jpeg",
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickFromPool(poolKeys: number[], seed: string): DashboardImageAsset {
  const index = poolKeys[hashString(seed) % poolKeys.length] ?? 0;
  return DASHBOARD_EDITORIAL_POOL[index] ?? DASHBOARD_EDITORIAL_POOL[0];
}

export function getEditorialImageAsset(seed: string): DashboardImageAsset {
  return pickFromPool(CATEGORY_POOL_KEYS.default, seed);
}

export function getEditorialImageUrl(seed: string): string {
  return getEditorialImageAsset(seed).src;
}

export function getEditorialObjectPosition(seed: string): string | undefined {
  return getEditorialImageAsset(seed).objectPosition;
}

export function getCategoryImageAsset(category: string, seed: string): DashboardImageAsset {
  const poolKeys = CATEGORY_POOL_KEYS[category] ?? CATEGORY_POOL_KEYS.default;
  const index = poolKeys[hashString(seed) % poolKeys.length] ?? 0;
  return DASHBOARD_EDITORIAL_POOL[index] ?? DASHBOARD_EDITORIAL_POOL[0];
}

export function getOpportunityCategoryImage(category: string): string {
  return getCategoryImageAsset(category, `category-${category}`).src;
}

export function getPartnershipImageUrl(category: string, businessId: string): string {
  if (PROPERTY_IMAGE_OVERRIDES[businessId]) {
    return PROPERTY_IMAGE_OVERRIDES[businessId];
  }
  return getCategoryImageAsset(category, `${businessId}-${category}`).src;
}

export function getPartnershipObjectPosition(category: string, businessId: string): string | undefined {
  if (PROPERTY_IMAGE_OVERRIDES[businessId]) {
    const match = DASHBOARD_EDITORIAL_POOL.find((img) => img.src === PROPERTY_IMAGE_OVERRIDES[businessId]);
    return match?.objectPosition;
  }
  return getCategoryImageAsset(category, `${businessId}-${category}`).objectPosition;
}

export function getContentIdeaImageAsset(format: string, ideaId: string): DashboardImageAsset {
  const poolKeys = CONTENT_FORMAT_POOL_KEYS[format] ?? CONTENT_FORMAT_POOL_KEYS.default;
  const index = poolKeys[hashString(`${ideaId}-${format}`) % poolKeys.length] ?? 0;
  return DASHBOARD_EDITORIAL_POOL[index] ?? DASHBOARD_EDITORIAL_POOL[0];
}

export function getContentIdeaImageUrl(format: string, ideaId: string): string {
  return getContentIdeaImageAsset(format, ideaId).src;
}

export function getHubCardImage(key: keyof typeof HUB_CARD_IMAGES): string {
  return HUB_CARD_IMAGES[key];
}

export function getResourceImageUrl(resourceId: string): string {
  return RESOURCE_IMAGES[resourceId] ?? getEditorialImageUrl(`resource-${resourceId}`);
}

/**
 * Curated luxury editorial library for the Creator Development System dashboard.
 * Assets live under /public/luxury-editorial — not used on marketing pages.
 */

export type EditorialTheme =
  | "hotel"
  | "boutique-hotel"
  | "resort"
  | "villa"
  | "restaurant"
  | "cafe"
  | "wellness"
  | "yacht"
  | "experience"
  | "creator"
  | "content"
  | "strategy"
  | "dining"
  | "beach";

export type LuxuryEditorialAsset = {
  id: string;
  src: string;
  themes: EditorialTheme[];
  objectPosition?: string;
};

const BASE = "/luxury-editorial";

export const LUXURY_EDITORIAL_CATALOG: LuxuryEditorialAsset[] = [
  { id: "property-amanzoe-pool", src: `${BASE}/property-amanzoe-pool.jpeg`, themes: ["resort", "villa", "hotel", "wellness"], objectPosition: "center 42%" },
  { id: "hotel-boutique-mykonos", src: `${BASE}/hotel-boutique-mykonos.jpeg`, themes: ["boutique-hotel", "hotel", "beach"], objectPosition: "center 40%" },
  { id: "hotel-beach-cabana-daybeds", src: `${BASE}/hotel-beach-cabana-daybeds.jpeg`, themes: ["boutique-hotel", "hotel", "beach", "wellness"], objectPosition: "center 45%" },
  { id: "hotel-riviera-architecture", src: `${BASE}/hotel-riviera-architecture.jpeg`, themes: ["hotel", "boutique-hotel", "experience"], objectPosition: "center center" },
  { id: "resort-villa-pool-tuscany", src: `${BASE}/resort-villa-pool-tuscany.jpeg`, themes: ["resort", "villa"], objectPosition: "center 38%" },
  { id: "resort-pool-loungers-editorial", src: `${BASE}/resort-pool-loungers-editorial.jpeg`, themes: ["resort", "hotel", "wellness"], objectPosition: "center 40%" },
  { id: "resort-pool-olive-luxury", src: `${BASE}/resort-pool-olive-luxury.jpeg`, themes: ["resort", "wellness", "hotel"], objectPosition: "center 42%" },
  { id: "resort-infinity-palm", src: `${BASE}/resort-infinity-palm.jpeg`, themes: ["resort", "beach", "villa"], objectPosition: "center 35%" },
  { id: "resort-infinity-pool-twilight", src: `${BASE}/resort-infinity-pool-twilight.jpeg`, themes: ["resort", "villa", "hotel"], objectPosition: "center 40%" },
  { id: "resort-terrace-yacht-view", src: `${BASE}/resort-terrace-yacht-view.jpeg`, themes: ["resort", "hotel", "yacht"], objectPosition: "center 38%" },
  { id: "resort-coastal-jetski-view", src: `${BASE}/resort-coastal-jetski-view.jpeg`, themes: ["resort", "experience", "beach"], objectPosition: "center center" },
  { id: "resort-cliffside-loungers", src: `${BASE}/resort-cliffside-loungers.jpeg`, themes: ["resort", "beach", "experience"], objectPosition: "center 42%" },
  { id: "resort-olive-grove-pool", src: `${BASE}/resort-olive-grove-pool.jpeg`, themes: ["resort", "villa", "wellness"], objectPosition: "center 40%" },
  { id: "resort-minimalist-patio-pool", src: `${BASE}/resort-minimalist-patio-pool.jpeg`, themes: ["resort", "villa", "boutique-hotel"], objectPosition: "center 38%" },
  { id: "resort-thatched-umbrella-pool", src: `${BASE}/resort-thatched-umbrella-pool.jpeg`, themes: ["resort", "beach"], objectPosition: "center 42%" },
  { id: "resort-beach-club-loungers", src: `${BASE}/resort-beach-club-loungers.jpeg`, themes: ["resort", "beach", "experience"], objectPosition: "center 40%" },
  { id: "resort-pool-evening-wine", src: `${BASE}/resort-pool-evening-wine.jpeg`, themes: ["resort", "villa", "dining"], objectPosition: "center 38%" },
  { id: "villa-ocean-arch-terrace", src: `${BASE}/villa-ocean-arch-terrace.jpeg`, themes: ["villa", "resort", "boutique-hotel"], objectPosition: "center center" },
  { id: "villa-terrace-mediterranean", src: `${BASE}/villa-terrace-mediterranean.jpeg`, themes: ["villa", "resort"], objectPosition: "center 42%" },
  { id: "villa-santorini-wicker-terrace", src: `${BASE}/villa-santorini-wicker-terrace.jpeg`, themes: ["villa", "boutique-hotel", "hotel"], objectPosition: "center 40%" },
  { id: "villa-santorini-caldera-chairs", src: `${BASE}/villa-santorini-caldera-chairs.jpeg`, themes: ["villa", "boutique-hotel", "hotel"], objectPosition: "center 38%" },
  { id: "villa-coastal-terrace-chairs", src: `${BASE}/villa-coastal-terrace-chairs.jpeg`, themes: ["villa", "resort"], objectPosition: "center 40%" },
  { id: "villa-coastal-stone-arch", src: `${BASE}/villa-coastal-stone-arch.jpeg`, themes: ["villa", "resort", "experience"], objectPosition: "center center" },
  { id: "villa-coastal-arch-window", src: `${BASE}/villa-coastal-arch-window.jpeg`, themes: ["villa", "resort", "experience"], objectPosition: "center center" },
  { id: "villa-lake-como-lounge", src: `${BASE}/villa-lake-como-lounge.jpeg`, themes: ["villa", "hotel", "experience"], objectPosition: "center 42%" },
  { id: "villa-luxury-bathroom-ocean", src: `${BASE}/villa-luxury-bathroom-ocean.jpeg`, themes: ["villa", "wellness", "hotel"], objectPosition: "center 45%" },
  { id: "villa-infinity-pool-lifestyle", src: `${BASE}/villa-infinity-pool-lifestyle.jpeg`, themes: ["villa", "resort", "content"], objectPosition: "center 38%" },
  { id: "villa-ocean-living-editorial", src: `${BASE}/villa-ocean-living-editorial.jpeg`, themes: ["villa", "content", "creator"], objectPosition: "center 40%" },
  { id: "dining-poolside-lifestyle", src: `${BASE}/dining-poolside-lifestyle.jpeg`, themes: ["restaurant", "dining", "resort"], objectPosition: "center 45%" },
  { id: "dining-breakfast-pool-tray", src: `${BASE}/dining-breakfast-pool-tray.jpeg`, themes: ["restaurant", "dining", "resort", "cafe"], objectPosition: "center 42%" },
  { id: "dining-breakfast-infinity-pool", src: `${BASE}/dining-breakfast-infinity-pool.jpeg`, themes: ["restaurant", "dining", "resort", "cafe"], objectPosition: "center 40%" },
  { id: "cafe-espresso-terrace-sea", src: `${BASE}/cafe-espresso-terrace-sea.jpeg`, themes: ["cafe", "dining", "creator"], objectPosition: "center 42%" },
  { id: "yacht-aerial-luxury", src: `${BASE}/yacht-aerial-luxury.jpeg`, themes: ["yacht", "experience", "strategy"], objectPosition: "center center" },
  { id: "yacht-lifestyle-tennis", src: `${BASE}/yacht-lifestyle-tennis.jpeg`, themes: ["yacht", "experience", "content"], objectPosition: "center 38%" },
  { id: "yacht-champagne-luxury", src: `${BASE}/yacht-champagne-luxury.jpeg`, themes: ["yacht", "dining", "strategy", "experience"], objectPosition: "center 42%" },
  { id: "creator-workspace-ocean", src: `${BASE}/creator-workspace-ocean.jpeg`, themes: ["creator", "strategy", "content"], objectPosition: "center 35%" },
  { id: "creator-reading-terrace-sunset", src: `${BASE}/creator-reading-terrace-sunset.jpeg`, themes: ["creator", "strategy", "villa"], objectPosition: "center 40%" },
  { id: "content-creator-santorini-hat", src: `${BASE}/content-creator-santorini-hat.jpeg`, themes: ["content", "creator", "villa"], objectPosition: "center 38%" },
  { id: "content-creator-pool-editorial", src: `${BASE}/content-creator-pool-editorial.jpeg`, themes: ["content", "creator", "resort"], objectPosition: "center 40%" },
  { id: "content-editorial-oversized-hat", src: `${BASE}/content-editorial-oversized-hat.jpeg`, themes: ["content", "creator"], objectPosition: "center 42%" },
  { id: "strategy-luxury-yacht-sunset", src: `${BASE}/strategy-luxury-yacht-sunset.jpeg`, themes: ["strategy", "yacht", "creator"], objectPosition: "center 38%" },
];

export const LUXURY_EDITORIAL_BY_ID = Object.fromEntries(
  LUXURY_EDITORIAL_CATALOG.map((asset) => [asset.id, asset])
) as Record<string, LuxuryEditorialAsset>;

/** Property cards with a known editorial match */
export const PROPERTY_EDITORIAL_IDS: Record<string, string> = {
  "tokyo-aman": "property-amanzoe-pool",
  "miami-faena": "resort-pool-loungers-editorial",
  "miami-standard": "hotel-beach-cabana-daybeds",
  "miami-1-hotel": "resort-infinity-palm",
  "miami-betsy": "hotel-riviera-architecture",
  "miami-vagabond": "hotel-boutique-mykonos",
  "miami-life-house": "hotel-boutique-mykonos",
  "nyc-bowery": "hotel-riviera-architecture",
  "nyc-standard-highline": "hotel-beach-cabana-daybeds",
  "la-proper": "villa-ocean-living-editorial",
  "la-santa-monica-proper": "resort-infinity-palm",
  "la-beverly-hills-hotel": "villa-lake-como-lounge",
  "paris-rosewood": "villa-luxury-bathroom-ocean",
  "paris-le-bristol": "property-amanzoe-pool",
  "paris-shangri-la": "villa-lake-como-lounge",
  "london-connaught": "villa-lake-como-lounge",
  "london-rosewood": "villa-luxury-bathroom-ocean",
  "london-chiltern": "dining-poolside-lifestyle",
  "ba-faena": "resort-pool-loungers-editorial",
  "ad-rosewood": "villa-lake-como-lounge",
  "tulum-azulik": "villa-ocean-arch-terrace",
  "tulum-be-tulum": "resort-beach-club-loungers",
  "tulum-habitas": "resort-beach-club-loungers",
  "bcn-cotton-house": "hotel-riviera-architecture",
  "bcn-w": "resort-coastal-jetski-view",
  "bcn-yurbban": "hotel-boutique-mykonos",
  "ct-silo": "villa-lake-como-lounge",
  "ct-gorgeous": "hotel-boutique-mykonos",
  "dubai-jumeirah": "resort-terrace-yacht-view",
  "dubai-sofitel": "resort-beach-club-loungers",
  "bali-como": "villa-luxury-bathroom-ocean",
  "bali-alila": "villa-infinity-pool-lifestyle",
  "singapore-raffles": "villa-lake-como-lounge",
  "rome-edition": "villa-ocean-living-editorial",
  "prg-alchymist": "villa-luxury-bathroom-ocean",
};

export const CATEGORY_EDITORIAL_THEMES: Record<string, EditorialTheme[]> = {
  "Boutique Hotel": ["boutique-hotel", "hotel", "villa"],
  "Small Luxury Hotel": ["hotel", "boutique-hotel", "resort"],
  "Local Boutique Hotels": ["boutique-hotel", "hotel"],
  Resort: ["resort", "beach", "villa"],
  "Villa Retreat": ["villa", "resort"],
  "Luxury Villa": ["villa", "resort"],
  Restaurant: ["restaurant", "dining"],
  "Local Dining Partners": ["restaurant", "dining"],
  "Restaurant & Hotel": ["restaurant", "dining", "hotel"],
  "Restaurant & Experience": ["restaurant", "dining", "experience"],
  Café: ["cafe", "dining"],
  "Café UGC": ["cafe", "creator", "content"],
  "Wellness Hotel": ["wellness", "resort", "hotel"],
  "Boutique Hotel & Spa": ["wellness", "boutique-hotel", "resort"],
  "Sustainable Luxury Hotel": ["wellness", "resort", "hotel"],
  "Luxury Hotel": ["hotel", "resort", "villa"],
  "Luxury Hotel Group": ["hotel", "resort"],
  "Luxury Experiences": ["experience", "yacht", "resort"],
  "Hospitality Brand": ["hotel", "experience", "strategy"],
  "Hospitality Experience": ["experience", "resort", "beach"],
  "Tourism Brand": ["experience", "strategy", "beach"],
};

export const CONTENT_FORMAT_EDITORIAL_THEMES: Record<string, EditorialTheme[]> = {
  Reel: ["content", "creator", "villa", "resort"],
  TikTok: ["content", "creator", "resort"],
  Photo: ["content", "villa", "hotel", "creator"],
  Carousel: ["content", "strategy", "hotel", "villa"],
  "Story Series": ["content", "creator", "beach", "resort"],
  Campaign: ["strategy", "content", "yacht", "hotel"],
  Portfolio: ["creator", "content", "strategy"],
  UGC: ["content", "creator", "cafe"],
  "Talking-head": ["creator", "strategy"],
  Review: ["restaurant", "hotel", "resort"],
  Educational: ["creator", "strategy"],
};

export const HUB_EDITORIAL_IDS = {
  today: "dining-breakfast-infinity-pool",
  pitch: "creator-workspace-ocean",
  partnerships: "property-amanzoe-pool",
  content: "content-creator-santorini-hat",
  resources: "strategy-luxury-yacht-sunset",
  wins: "yacht-aerial-luxury",
} as const;

export const RESOURCE_EDITORIAL_IDS: Record<string, string> = {
  "media-kit": "creator-workspace-ocean",
  "outreach-tracker": "strategy-luxury-yacht-sunset",
  "partnership-tracker": "property-amanzoe-pool",
  "content-planning": "content-creator-pool-editorial",
  "rate-card": "villa-lake-como-lounge",
  "portfolio-checklist": "content-editorial-oversized-hat",
  portfolio: "creator-reading-terrace-sunset",
};

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickEditorialByThemes(
  themes: EditorialTheme[],
  seed: string
): LuxuryEditorialAsset {
  const uniqueThemes = [...new Set(themes)];
  const matches = LUXURY_EDITORIAL_CATALOG.filter((asset) =>
    asset.themes.some((theme) => uniqueThemes.includes(theme))
  );

  const pool =
    matches.length > 0
      ? [...matches].sort((a, b) => a.id.localeCompare(b.id))
      : LUXURY_EDITORIAL_CATALOG;

  const index = hashString(seed) % pool.length;
  return pool[index] ?? LUXURY_EDITORIAL_CATALOG[0];
}

export function getEditorialAssetById(id: string): LuxuryEditorialAsset {
  return LUXURY_EDITORIAL_BY_ID[id] ?? LUXURY_EDITORIAL_CATALOG[0];
}

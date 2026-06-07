/** Verified Unsplash hospitality editorial photos (HEAD-checked) */
const VERIFIED_IMAGES = [
  "photo-1631049307264-da0ec9d70304",
  "photo-1566073771259-6a8506099945",
  "photo-1582719508461-905c673771fd",
  "photo-1578683010236-d716f9a3f461",
  "photo-1414235077428-338989a2e8c0",
  "photo-1559339352-11d035aa65de",
  "photo-1613490493576-7fde63acd811",
  "photo-1506905925346-21bda4d32df4",
  "photo-1520250497591-112f2f40a3f4",
  "photo-1540555700478-4be289fbecef",
  "photo-1495474472287-4d71bcdd2085",
  "photo-1488646953014-85cb44e25828",
  "photo-1551882547-ff40c63fe5fa",
  "photo-1517248135467-4c7edcad34c4",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1590490360182-c33d57733427",
  "photo-1542314831-068cd1dbfeeb",
  "photo-1555396273-367ea4eb4db5",
  "photo-1600585154340-be6161a56a0c",
  "photo-1522771739844-6a9f6d5f14af",
  "photo-1618773928121-c32242e63f39",
  "photo-1515377905703-c4788e51af15",
  "photo-1554118811-1e0d58224f24",
  "photo-1600585154526-990dced4db0d",
  "photo-1600607687939-ce8a6c25118c",
  "photo-1501339847302-ac426a4a7cbb",
] as const;

const HOTEL_IMAGES = VERIFIED_IMAGES;
const RESTAURANT_IMAGES = VERIFIED_IMAGES;
const VILLA_IMAGES = VERIFIED_IMAGES;
const EXPERIENCE_IMAGES = VERIFIED_IMAGES;
const SPA_IMAGES = VERIFIED_IMAGES;
const CAFE_IMAGES = VERIFIED_IMAGES;

const CATEGORY_POOLS: Record<string, readonly string[]> = {
  "Boutique Hotel": HOTEL_IMAGES,
  "Small Luxury Hotel": HOTEL_IMAGES,
  "Luxury Hotel": HOTEL_IMAGES,
  "Luxury Hotel Group": HOTEL_IMAGES,
  Resort: HOTEL_IMAGES,
  "Wellness Hotel": SPA_IMAGES,
  "Boutique Hotel & Spa": SPA_IMAGES,
  Restaurant: RESTAURANT_IMAGES,
  "Restaurant & Hotel": RESTAURANT_IMAGES,
  "Restaurant & Experience": RESTAURANT_IMAGES,
  Café: CAFE_IMAGES,
  "Luxury Villa": VILLA_IMAGES,
  "Villa Retreat": VILLA_IMAGES,
  "Luxury Experiences": EXPERIENCE_IMAGES,
  "Hospitality Experience": EXPERIENCE_IMAGES,
  "Tourism Brand": EXPERIENCE_IMAGES,
  default: HOTEL_IMAGES,
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function partnershipImageUrl(category: string, businessId: string, imageIdx?: number): string {
  const pool = CATEGORY_POOLS[category] ?? CATEGORY_POOLS.default;
  const index =
    imageIdx !== undefined
      ? imageIdx % pool.length
      : hashString(`${businessId}-${category}`) % pool.length;
  const photoId = pool[index];
  return `https://images.unsplash.com/${photoId}?w=800&h=520&fit=crop&q=80&auto=format`;
}

export const LUXURY_EDITORIAL_IMAGES = VERIFIED_IMAGES;

export function editorialImageUrl(seed: string, width = 640, height = 420): string {
  const index = hashString(seed) % LUXURY_EDITORIAL_IMAGES.length;
  const photoId = LUXURY_EDITORIAL_IMAGES[index];
  return `https://images.unsplash.com/${photoId}?w=${width}&h=${height}&fit=crop&q=80&auto=format`;
}

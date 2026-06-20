import { isMajorChainBrand } from "@/lib/dashboard/partnership-stage-ranking";

/** Two grouped queries cover all hospitality categories with minimal credit use. */
export const GEOAPIFY_SEARCH_GROUPS = [
  {
    id: "accommodation",
    categories: [
      "accommodation.hotel",
      "accommodation.guest_house",
      "accommodation.hostel",
      "accommodation.apartment",
      "accommodation.chalet",
      "accommodation.motel",
    ],
    limit: 28,
  },
  {
    id: "dining-wellness",
    categories: [
      "catering.restaurant",
      "catering.cafe",
      "leisure.spa",
      "commercial.health_and_beauty",
      "entertainment.attraction",
      "tourism.sights",
    ],
    limit: 28,
  },
] as const;

export function geoapifyCreditsForResultCount(count: number): number {
  if (count <= 0) return 0;
  return Math.ceil(count / 20);
}

export function mapGeoapifyToCategory(categories: string[]): string {
  const joined = categories.join(" ").toLowerCase();

  if (joined.includes("apartment") || joined.includes("chalet") || joined.includes("villa")) {
    return "Luxury Villa";
  }
  if (joined.includes("spa") || joined.includes("health_and_beauty")) {
    return "Wellness & Spa";
  }
  if (joined.includes("restaurant")) return "Restaurant";
  if (joined.includes("cafe")) return "Café";
  if (joined.includes("attraction") || joined.includes("sights") || joined.includes("museum")) {
    return "Hospitality Experience";
  }
  if (joined.includes("hostel") || joined.includes("guest_house")) {
    return "Boutique Hotel";
  }
  if (joined.includes("hotel") || joined.includes("motel")) {
    if (joined.includes("luxury")) return "Small Luxury Hotel";
    return "Boutique Hotel";
  }

  return "Hospitality Brand";
}

export function inferTierFromPlace(name: string, category: string): 1 | 2 | 3 {
  const lower = name.toLowerCase();
  const luxuryWords = ["palace", "grand hotel", "collection", "luxury", "resort &", "resort and"];

  if (isMajorChainBrand(name)) {
    return luxuryWords.some((word) => lower.includes(word)) ? 3 : 2;
  }

  if (luxuryWords.some((word) => lower.includes(word))) return 3;
  if (category.includes("Restaurant") || category.includes("Café")) return 1;
  if (category.includes("Experience") || category.includes("Wellness")) return 2;
  if (category.includes("Villa")) return 2;
  if (category.includes("Luxury")) return 3;
  return 1;
}

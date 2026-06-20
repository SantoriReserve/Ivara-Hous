import {
  getEditorialImageUrl,
  getPartnershipImageUrl,
} from "@/lib/dashboard/dashboard-images";

/** @deprecated Use dashboard-images — kept for import compatibility */
export function partnershipImageUrl(category: string, businessId: string): string {
  return getPartnershipImageUrl(category, businessId);
}

export function editorialImageUrl(seed: string, _width = 640, _height = 420): string {
  return getEditorialImageUrl(seed);
}

export const LUXURY_EDITORIAL_IMAGES = [] as const;

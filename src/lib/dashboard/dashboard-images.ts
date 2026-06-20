/**
 * Dashboard image selection — uses /public/luxury-editorial only.
 * Marketing and site pages continue to use /public/images separately.
 */

import {
  CATEGORY_EDITORIAL_THEMES,
  CONTENT_FORMAT_EDITORIAL_THEMES,
  HUB_EDITORIAL_IDS,
  PROPERTY_EDITORIAL_IDS,
  RESOURCE_EDITORIAL_IDS,
  getEditorialAssetById,
  pickEditorialByThemes,
  type LuxuryEditorialAsset,
} from "@/lib/dashboard/luxury-editorial-catalog";
import { getVerifiedPropertyImageUrl } from "@/lib/dashboard/partnership-property-images";

export type DashboardImageAsset = {
  src: string;
  objectPosition?: string;
};

const DEFAULT_ASSET = getEditorialAssetById("property-amanzoe-pool");

export const DASHBOARD_IMAGE_FALLBACK = DEFAULT_ASSET.src;

/** @deprecated Use PROPERTY_EDITORIAL_IDS — kept for import compatibility */
export const PROPERTY_IMAGE_OVERRIDES: Record<string, string> = Object.fromEntries(
  Object.entries(PROPERTY_EDITORIAL_IDS).map(([businessId, editorialId]) => [
    businessId,
    getEditorialAssetById(editorialId).src,
  ])
);

function toDashboardAsset(asset: LuxuryEditorialAsset): DashboardImageAsset {
  return { src: asset.src, objectPosition: asset.objectPosition };
}

export function getEditorialImageAsset(seed: string): DashboardImageAsset {
  return toDashboardAsset(pickEditorialByThemes(["strategy", "creator", "content"], seed));
}

export function getEditorialImageUrl(seed: string): string {
  return getEditorialImageAsset(seed).src;
}

export function getEditorialObjectPosition(seed: string): string | undefined {
  return getEditorialImageAsset(seed).objectPosition;
}

export function getCategoryImageAsset(category: string, seed: string): DashboardImageAsset {
  const themes = CATEGORY_EDITORIAL_THEMES[category] ?? ["hotel", "resort", "villa"];
  return toDashboardAsset(pickEditorialByThemes(themes, `${seed}-${category}`));
}

export function getOpportunityCategoryImage(category: string): string {
  return getCategoryImageAsset(category, `category-${category}`).src;
}

export function getPartnershipImageUrl(category: string, businessId: string): string {
  const verified = getVerifiedPropertyImageUrl(businessId);
  if (verified) return verified;

  const propertyId = PROPERTY_EDITORIAL_IDS[businessId];
  if (propertyId) {
    return getEditorialAssetById(propertyId).src;
  }
  return getCategoryImageAsset(category, `${businessId}-${category}`).src;
}

export function getPartnershipObjectPosition(
  category: string,
  businessId: string
): string | undefined {
  const propertyId = PROPERTY_EDITORIAL_IDS[businessId];
  if (propertyId) {
    return getEditorialAssetById(propertyId).objectPosition;
  }
  return getCategoryImageAsset(category, `${businessId}-${category}`).objectPosition;
}

export function getContentIdeaImageAsset(format: string, ideaId: string): DashboardImageAsset {
  const themes = CONTENT_FORMAT_EDITORIAL_THEMES[format] ?? ["content", "creator", "strategy"];
  return toDashboardAsset(pickEditorialByThemes(themes, `${ideaId}-${format}`));
}

export function getContentIdeaImageUrl(format: string, ideaId: string): string {
  return getContentIdeaImageAsset(format, ideaId).src;
}

export function getHubCardImage(key: keyof typeof HUB_EDITORIAL_IDS): string {
  return getEditorialAssetById(HUB_EDITORIAL_IDS[key]).src;
}

export function getHubCardImageAsset(key: keyof typeof HUB_EDITORIAL_IDS): DashboardImageAsset {
  return toDashboardAsset(getEditorialAssetById(HUB_EDITORIAL_IDS[key]));
}

export function getResourceImageUrl(resourceId: string): string {
  const editorialId = RESOURCE_EDITORIAL_IDS[resourceId];
  if (editorialId) {
    return getEditorialAssetById(editorialId).src;
  }
  return getEditorialImageUrl(`resource-${resourceId}`);
}

export function getResourceObjectPosition(resourceId: string): string | undefined {
  const editorialId = RESOURCE_EDITORIAL_IDS[resourceId];
  if (editorialId) {
    return getEditorialAssetById(editorialId).objectPosition;
  }
  return getEditorialObjectPosition(`resource-${resourceId}`);
}

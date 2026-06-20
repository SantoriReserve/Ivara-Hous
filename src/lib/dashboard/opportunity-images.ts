import {
  DASHBOARD_IMAGE_FALLBACK,
  getContentIdeaImageUrl,
  getOpportunityCategoryImage,
} from "@/lib/dashboard/dashboard-images";

export const OPPORTUNITY_IMAGE_FALLBACK = DASHBOARD_IMAGE_FALLBACK;

export const CONTENT_IMAGE_FALLBACK = DASHBOARD_IMAGE_FALLBACK;

export function getOpportunityImage(category: string): string {
  return getOpportunityCategoryImage(category);
}

export function getContentFormatImage(format: string, ideaId?: string): string {
  return getContentIdeaImageUrl(format, ideaId ?? `format-${format}`);
}

export function getContentIdeaImage(ideaId: string, format: string): string {
  return getContentIdeaImageUrl(format, ideaId);
}

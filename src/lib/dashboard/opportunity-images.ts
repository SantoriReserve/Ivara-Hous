import { editorialImageUrl } from "@/lib/dashboard/partnership-image-pool";

const LUXURY_FALLBACK =
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=520&fit=crop&q=80&auto=format";

export const OPPORTUNITY_CATEGORY_IMAGES: Record<string, string> = {
  "Boutique Hotel": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=520&fit=crop&q=80&auto=format",
  "Small Luxury Hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=520&fit=crop&q=80&auto=format",
  "Local Boutique Hotels": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=520&fit=crop&q=80&auto=format",
  Resort: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=520&fit=crop&q=80&auto=format",
  "Villa Retreat": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=520&fit=crop&q=80&auto=format",
  "Luxury Villa": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=520&fit=crop&q=80&auto=format",
  Restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=520&fit=crop&q=80&auto=format",
  "Local Dining Partners": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=520&fit=crop&q=80&auto=format",
  "Restaurant & Hotel": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=520&fit=crop&q=80&auto=format",
  "Restaurant & Experience": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=520&fit=crop&q=80&auto=format",
  Café: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=520&fit=crop&q=80&auto=format",
  "Café UGC": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=520&fit=crop&q=80&auto=format",
  "Wellness Hotel": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=520&fit=crop&q=80&auto=format",
  "Boutique Hotel & Spa": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=520&fit=crop&q=80&auto=format",
  "Sustainable Luxury Hotel": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=520&fit=crop&q=80&auto=format",
  "Luxury Hotel": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=520&fit=crop&q=80&auto=format",
  "Luxury Hotel Group": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=520&fit=crop&q=80&auto=format",
  "Luxury Experiences": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=520&fit=crop&q=80&auto=format",
  "Hospitality Brand": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=520&fit=crop&q=80&auto=format",
  "Hospitality Experience": "https://images.unsplash.com/photo-1469854523086-cc02afe5c880?w=800&h=520&fit=crop&q=80&auto=format",
  "Tourism Brand": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=520&fit=crop&q=80&auto=format",
  default: LUXURY_FALLBACK,
};

export const OPPORTUNITY_IMAGE_FALLBACK = LUXURY_FALLBACK;

export function getOpportunityImage(category: string): string {
  return OPPORTUNITY_CATEGORY_IMAGES[category] ?? OPPORTUNITY_CATEGORY_IMAGES.default;
}

export const CONTENT_IMAGE_FALLBACK = editorialImageUrl("content-fallback", 640, 420);

export function getContentFormatImage(format: string, ideaId?: string): string {
  const seed = ideaId ? `${ideaId}-${format}` : `format-${format}`;
  return editorialImageUrl(seed, 640, 420);
}

export function getContentIdeaImage(ideaId: string, format: string): string {
  return getContentFormatImage(format, ideaId);
}

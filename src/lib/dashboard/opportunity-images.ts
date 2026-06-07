export const OPPORTUNITY_CATEGORY_IMAGES: Record<string, string> = {
  "Boutique Hotel": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=640&h=420&fit=crop&q=80",
  "Local Boutique Hotels": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=640&h=420&fit=crop&q=80",
  "Resort": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=640&h=420&fit=crop&q=80",
  "Villa Retreat": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&h=420&fit=crop&q=80",
  "Luxury Villa": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=640&h=420&fit=crop&q=80",
  Restaurant: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=640&h=420&fit=crop&q=80",
  "Local Dining Partners": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=640&h=420&fit=crop&q=80",
  "Restaurant & Hotel": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=640&h=420&fit=crop&q=80",
  "Restaurant & Experience": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=640&h=420&fit=crop&q=80",
  Café: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=640&h=420&fit=crop&q=80",
  "Café UGC": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=640&h=420&fit=crop&q=80",
  "Wellness Hotel": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=640&h=420&fit=crop&q=80",
  "Sustainable Luxury Hotel": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=640&h=420&fit=crop&q=80",
  "Luxury Hotel Group": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=640&h=420&fit=crop&q=80",
  "Luxury Experiences": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=420&fit=crop&q=80",
  "Hospitality Brand": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=640&h=420&fit=crop&q=80",
  "Hospitality Experience": "https://images.unsplash.com/photo-1469854523086-cc02afe5c880?w=640&h=420&fit=crop&q=80",
  "Tourism Brand": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=640&h=420&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=640&h=420&fit=crop&q=80",
};

export function getOpportunityImage(category: string): string {
  return OPPORTUNITY_CATEGORY_IMAGES[category] ?? OPPORTUNITY_CATEGORY_IMAGES.default;
}

export const CONTENT_FORMAT_IMAGES: Record<string, string> = {
  Reel: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=480&h=320&fit=crop&q=80",
  TikTok: "https://images.unsplash.com/photo-1611605698323-b1e99d37f04e?w=480&h=320&fit=crop&q=80",
  Photo: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=480&h=320&fit=crop&q=80",
  Carousel: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=480&h=320&fit=crop&q=80",
  "Story Series": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480&h=320&fit=crop&q=80",
  Campaign: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=480&h=320&fit=crop&q=80",
  Portfolio: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=480&h=320&fit=crop&q=80",
  UGC: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=480&h=320&fit=crop&q=80",
  "Talking-head": "https://images.unsplash.com/photo-1598550487031-856e8c741d22?w=480&h=320&fit=crop&q=80",
  Review: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=480&h=320&fit=crop&q=80",
  Educational: "https://images.unsplash.com/photo-1434030214721-735608b96815?w=480&h=320&fit=crop&q=80",
  default: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=480&h=320&fit=crop&q=80",
};

export function getContentFormatImage(format: string): string {
  return CONTENT_FORMAT_IMAGES[format] ?? CONTENT_FORMAT_IMAGES.default;
}

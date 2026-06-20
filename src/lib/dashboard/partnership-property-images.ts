/**
 * Verified public images for curated partnership properties.
 * Used before luxury-editorial fallbacks — each URL points to the actual property when available.
 */

export const PARTNERSHIP_PROPERTY_IMAGES: Record<string, string> = {
  "miami-betsy":
    "https://www.thebetsyhotel.com/sites/default/files/styles/hero_desktop/public/2026-02/betsy-first-frame2.png",
  "miami-standard":
    "https://www.standardhotels.com/wp-content/uploads/2021/06/Miami-Beach-Standard-Hotel-Pool-1.jpg",
  "miami-faena":
    "https://www.faena.com/sites/default/files/styles/hero/public/2023-06/faena-hotel-miami-beach-exterior.jpg",
  "miami-1-hotel":
    "https://www.1hotels.com/content/dam/1hotels/south-beach/images/hero/south-beach-hero.jpg",
  "miami-life-house":
    "https://www.lifehousehotels.com/wp-content/uploads/2021/03/Life-House-Little-Havana-Exterior.jpg",
  "miami-vagabond":
    "https://www.vagabondhotel.com/wp-content/uploads/2019/05/vagabond-pool-hero.jpg",
  "miami-local-house":
    "https://www.thelocalhouse.com/wp-content/uploads/2022/05/local-house-exterior.jpg",
  "miami-esme":
    "https://www.esmehotel.com/wp-content/uploads/2021/11/esme-hotel-exterior.jpg",
  "miami-casa-faena":
    "https://www.faena.com/sites/default/files/styles/hero/public/2023-06/casa-faena-exterior.jpg",
  "miami-mandolin":
    "https://www.mandolinrestaurant.com/wp-content/uploads/2019/05/mandolin-garden.jpg",
  "miami-plymouth":
    "https://www.theplymouth.com/wp-content/uploads/2019/06/plymouth-pool.jpg",
  "miami-setai":
    "https://www.thesetaihotel.com/wp-content/uploads/2021/03/setai-pool-aerial.jpg",
  "nyc-bowery":
    "https://www.theboweryhotel.com/wp-content/uploads/2019/05/bowery-lobby.jpg",
  "bcn-cotton-house":
    "https://www.cottonhousehotel.com/wp-content/uploads/2019/03/cotton-house-lobby.jpg",
  "tulum-azulik":
    "https://www.azulik.com/wp-content/uploads/2021/03/azulik-villa.jpg",
};

export function getVerifiedPropertyImageUrl(businessId: string): string | null {
  return PARTNERSHIP_PROPERTY_IMAGES[businessId] ?? null;
}

export function isExternalImageUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

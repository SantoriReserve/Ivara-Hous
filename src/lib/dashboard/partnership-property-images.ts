/**
 * Verified public images for curated partnership properties.
 * Each URL should show the actual property — not logos, icons, or stock art.
 */

const INVALID_IMAGE_PATTERNS = [
  /logo/i,
  /icon/i,
  /favicon/i,
  /hugedomains/i,
  /cropped-android-chrome/i,
  /wordmark/i,
  /sticker/i,
  /\.svg(?:\?|$)/i,
  /og_hugedomains/i,
  /soho-logo/i,
  /newspaper\.png/i,
];

export const PARTNERSHIP_PROPERTY_IMAGES: Record<string, string> = {
  "miami-betsy":
    "https://www.thebetsyhotel.com/sites/default/files/styles/hero_desktop/public/2026-02/betsy-first-frame2.png",
  "miami-esme":
    "https://image-tc.galaxy.tf/wijpeg-d7v84xq9pe3kdzkm0rjpwn9q/lobby1.jpg?width=1920",
  "miami-plymouth":
    "https://image-tc.galaxy.tf/wijpeg-1y79t2hueoa39otnl0mm59f56/image-1.jpg?width=1920",
  "miami-komodo": "https://komodomiami.com/wp-content/uploads/2025/05/DSC_3436.jpg",
  "miami-1-hotel":
    "https://www.1hotels.com/sites/1hotels.com/files/brandfolder/7b9bx9cbk65j9ngxk35fq7bv/Main_Pool_4w1440.png",
  "miami-freehand":
    "https://freehandhotels.com/miami/wp-content/uploads/sites/2/2024/01/Header_home_Miami.jpg",
  "miami-wynwood":
    "https://arlohotels.com/wynwood/wp-content/uploads/sites/6/2022/11/202210_Wynwood_Lifestyle_Staircase1-2048x1366.jpg",
  "miami-nautilus":
    "https://arlohotels.com/nautilus/wp-content/uploads/sites/7/2023/05/Nautilus_Pool_002-2048x1365.jpg",
  "miami-faena":
    "https://www.faena.com/sites/default/files/styles/hero/public/2023-06/faena-hotel-miami-beach-exterior.jpg",
  "miami-casa-faena":
    "https://www.faena.com/sites/default/files/styles/hero/public/2023-06/casa-faena-exterior.jpg",
  "miami-carbone":
    "https://cdn.sanity.io/images/gb1p0gbj/production/3bc000c3a9de5627781d6f58ca2990157e70648e-720x720.png",
  "miami-setai":
    "https://www.thesetaihotel.com/wp-content/uploads/2021/03/setai-pool-aerial.jpg",
  "miami-edition":
    "https://www.editionhotels.com/wp-content/uploads/2019/09/EDITION_MiamiBeach_hero.jpg",
  "miami-mandolin":
    "https://images.getbento.com/accounts/46c3628b83ff859c5f0fcb6aad5825ea/media/I7SCeEFzS9iXr7WQvTpD_Mandolin_Aegean_Bistro.jpg?w=1200&fit=crop&auto=compress,format",
  "miami-all-day":
    "https://static.wixstatic.com/media/c833bb_3b88fc0be7ea4eb4be03a36ef2499152~mv2.jpg/v1/fill/w_1920,h_1080,al_c/c833bb_3b88fc0be7ea4eb4be03a36ef2499152~mv2.jpg",
  "miami-local-house":
    "https://www.thelocalhouse.com/wp-content/uploads/2022/05/local-house-exterior.jpg",
  "nyc-crosby":
    "https://www.firmdalehotels.com/media/u4xkpbrc/240910_f_cs_o_251_webresa.jpg",
  "nyc-eleven-madison":
    "https://www.elevenmadisonpark.com/app/uploads/2024/04/EMP_DiningRoom_2024.jpg",
  "la-proper":
    "https://www.properhotel.com/wp-content/uploads/2022/01/DTLA_3-2_Guestroom_51.jpg",
  "la-santa-monica-proper":
    "https://www.properhotel.com/wp-content/uploads/2019/07/SMP_Rooms_Ingals_Apr_2019_Extra_0106_052A0838_Mobile.jpg",
  "paris-hoxton": "https://thehoxton.com/wp-content/uploads/sites/5/2020/05/Paris_Hero.jpg",
  "paris-hotel-particulier":
    "https://www.hotelparticulier.com/wp-content/uploads/2019/06/hotel-particulier-montmartre.jpg",
  "paris-rosewood":
    "https://images.rosewoodhotels.com/is/image/rwhg/htel-de-crillon-suite-duc-de-crillon-209-living-by-reto-guntli",
  "paris-mama-shelter":
    "https://mamashelter.com/paris-east/wp-content/uploads/sites/16/2020/10/Mama-East-09-4134_FA.jpg",
  "london-hoxton": "https://thehoxton.com/wp-content/uploads/sites/5/2020/05/Shoreditch_Hero.jpg",
  "london-rosewood":
    "https://images.rosewoodhotels.com/is/image/rwhg/heroshot-punta-bonita-pool-and-beach-1",
  "london-dishoom":
    "https://cdn.sanity.io/images/daku84np/production/b492504165ed7b5327abddaf1086b7a099f65418-1200x797.jpg",
  "london-connaught":
    "https://library.maybourne.com/transform/8d5ab76f-ffc3-4616-a7be-5c3267b3fa8f/CON-EXTERIOR-01",
  "bcn-yurbban": "https://www.yurbban.com/wp-content/uploads/2019/03/yurbban-passage-hotel.jpg",
  "bcn-disfrutar":
    "https://www.disfrutarbarcelona.com/api/uploads/restaurant/slider/images/original/cd60e682ef18d378de9e38ab983d2f2b_phpup3Axy.jpg",
  "bcn-el-nacional":
    "https://www.elnacionalbcn.com/wp-content/uploads/2018/11/el-nacional-interior.jpg",
  "tulum-azulik": "https://www.azulik.com/wp-content/uploads/2021/03/azulik-villa.jpg",
  "bcn-cotton-house":
    "https://www.cottonhousehotel.com/wp-content/uploads/2019/03/cotton-house-lobby.jpg",
};

export function isValidPropertyImageUrl(url: string): boolean {
  if (!url.startsWith("http")) return false;
  return !INVALID_IMAGE_PATTERNS.some((pattern) => pattern.test(url));
}

export function getVerifiedPropertyImageUrl(businessId: string): string | null {
  const url = PARTNERSHIP_PROPERTY_IMAGES[businessId];
  if (!url || !isValidPropertyImageUrl(url)) return null;
  return url;
}

export function isExternalImageUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

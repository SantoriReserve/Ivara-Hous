import { fillContext } from "@/lib/dashboard/fill-context";
import { getCategoryImageAsset } from "@/lib/dashboard/dashboard-images";
import type { CachedPartnershipPlace } from "@/lib/dashboard/partnership-cache-repository";
import type { GeoapifyPlace } from "@/lib/dashboard/partnership-geoapify";
import {
  inferTierFromPlace,
  mapGeoapifyToCategory,
} from "@/lib/dashboard/partnership-geoapify-categories";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import { formatInstagramDisplay, normalizeWebsiteUrl } from "@/lib/dashboard/partnership-result-utils";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

const TIER_LABELS: Record<1 | 2 | 3, string> = {
  1: "Tier 1 — Easy Wins",
  2: "Tier 2 — Established Partners",
  3: "Tier 3 — Luxury & Stretch",
};

function pitchForCategory(category: string): { id: string; title: string } {
  if (category.includes("Restaurant") || category.includes("Café")) {
    return { id: "restaurant", title: PITCH_TEMPLATE_TITLES.restaurant ?? "Restaurant Feature Pitch" };
  }
  if (category.includes("Villa") || category.includes("Experience")) {
    return { id: "hosted-stay", title: PITCH_TEMPLATE_TITLES["hosted-stay"] ?? "Hosted Stay Pitch" };
  }
  return { id: "boutique-hotel", title: PITCH_TEMPLATE_TITLES["boutique-hotel"] ?? "Boutique Hotel Pitch" };
}

function scoresForTier(tier: 1 | 2 | 3): {
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  priority: PartnershipOpportunity["priority"];
} {
  if (tier === 1) return { opportunityScore: 5, difficultyScore: 2, valueScore: 4, priority: "high" };
  if (tier === 2) return { opportunityScore: 4, difficultyScore: 3, valueScore: 4, priority: "medium" };
  return { opportunityScore: 3, difficultyScore: 4, valueScore: 5, priority: "explore" };
}

function fallbackImage(category: string, seed: string): string {
  return getCategoryImageAsset(category, seed).src;
}

function contactWhereForPlace(website: string, phone: string | null): string {
  if (phone) return `Call ${phone} — or use the website contact form`;
  if (website) {
    return `Use the contact form on ${website.replace(/^https?:\/\/(www\.)?/, "")}`;
  }
  return "Contact details on property website";
}

export function discoveredPlaceToOpportunity(
  place: GeoapifyPlace | CachedPartnershipPlace,
  ctx: CreatorContext,
  locationLabel: string,
  imageUrl?: string | null
): PartnershipOpportunity {
  const categories =
    "geoapify_categories" in place ? place.geoapify_categories : place.categories;
  const category =
    "category" in place && place.category ? place.category : mapGeoapifyToCategory(categories);

  const tier = inferTierFromPlace(place.name, category);
  const pitch = pitchForCategory(category);
  const scores = scoresForTier(tier);
  const website = normalizeWebsiteUrl(place.website) ?? "";
  const instagram = formatInstagramDisplay(null);
  const externalId = "external_id" in place ? place.external_id : place.placeId;
  const resolvedImage =
    imageUrl ??
    ("image_url" in place ? place.image_url : null) ??
    fallbackImage(category, `geoapify-${externalId}-${category}`);

  return {
    id: `geoapify-${externalId}`,
    businessName: place.name,
    category,
    description: `${place.name} is a verified ${category.toLowerCase()} in ${locationLabel} — matched to your creator stage for hospitality partnerships.`,
    website,
    instagram,
    address: place.address,
    contactEmail: null,
    contactPerson: null,
    contactWhere: fillContext(ctx, contactWhereForPlace(website, place.phone)),
    outreachType: pitch.title,
    pitchTemplateId: pitch.id,
    pitchTemplateTitle: pitch.title,
    matchReason: fillContext(
      ctx,
      `Verified ${category.toLowerCase()} in ${locationLabel} for {niche} creators building {tier} proof.`
    ),
    whyYou: fillContext(
      ctx,
      `${place.name} is a Tier ${tier} outreach target for {stage} creators in {location}.`
    ),
    doToday: fillContext(
      ctx,
      website
        ? `Send ${pitch.title} via the website contact form. Reference one specific design or experience detail from ${place.name}.`
        : `Send ${pitch.title} to ${place.name}. Open with one visual detail tied to your {pillar} content.`
    ),
    priority: scores.priority,
    imageUrl: resolvedImage,
    opportunityScore: scores.opportunityScore,
    difficultyScore: scores.difficultyScore,
    valueScore: scores.valueScore,
    tierLabel: TIER_LABELS[tier],
    partnershipTier: tier,
    source: "discovered",
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitch.title} — personalize for {pillar} content and propose a clear deliverable package.`
    ),
    searchLocation: locationLabel,
  };
}

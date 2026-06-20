import { fillContext } from "@/lib/dashboard/fill-context";
import { getCategoryImageAsset } from "@/lib/dashboard/dashboard-images";
import type { CachedPartnershipPlace } from "@/lib/dashboard/partnership-cache-repository";
import {
  applyContactIntelToOpportunityFields,
  buildDiscoveredContactIntel,
  contactIntelFromCachedPlace,
} from "@/lib/dashboard/partnership-contact-intelligence";
import type { GeoapifyPlace } from "@/lib/dashboard/partnership-geoapify";
import {
  inferTierFromPlace,
  mapGeoapifyToCategory,
} from "@/lib/dashboard/partnership-geoapify-categories";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
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

function buildContactIntel(
  place: GeoapifyPlace | CachedPartnershipPlace
): ReturnType<typeof buildDiscoveredContactIntel> {
  if ("contact_intelligence" in place) {
    const cached = contactIntelFromCachedPlace(place);
    if (cached) return cached;
  }

  const instagram =
    "instagram" in place && place.instagram
      ? place.instagram
      : "placeId" in place
        ? place.instagram
        : null;

  return buildDiscoveredContactIntel({
    website: place.website,
    phone: place.phone,
    instagram,
    instagramSource: instagram ? "geoapify" : undefined,
  });
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
    "category" in place && "geoapify_categories" in place && place.category
      ? place.category
      : mapGeoapifyToCategory(categories);

  const tier = inferTierFromPlace(place.name, category);
  const pitch = pitchForCategory(category);
  const scores = scoresForTier(tier);
  const contactIntel = buildContactIntel(place);
  const contactFields = applyContactIntelToOpportunityFields(contactIntel);
  const externalId = "external_id" in place ? place.external_id : place.placeId;
  const resolvedImage =
    imageUrl ??
    ("image_url" in place ? place.image_url : null) ??
    fallbackImage(category, `geoapify-${externalId}-${category}`);

  const topEmail = contactIntel.emails[0];
  const doToday = topEmail
    ? fillContext(
        ctx,
        `Send ${pitch.title} to ${topEmail.email}. Reference one specific detail from ${place.name} and tie it to your {pillar} content.`
      )
    : contactIntel.instagram?.confidence === "verified"
      ? fillContext(
          ctx,
          `Send ${pitch.title} to ${contactIntel.instagram.handle}. Open with one visual detail from their feed tied to your {pillar} content.`
        )
      : contactFields.website
        ? fillContext(
            ctx,
            `Send ${pitch.title} via the official website contact form. Reference one specific detail from ${place.name}.`
          )
        : fillContext(
            ctx,
            `Research ${place.name}'s official website for verified contact details before sending ${pitch.title}.`
          );

  return {
    id: `geoapify-${externalId}`,
    businessName: place.name,
    category,
    description: `${place.name} is a verified ${category.toLowerCase()} in ${locationLabel} — matched to your creator stage for hospitality partnerships.`,
    website: contactFields.website,
    instagram: contactFields.instagram,
    address: place.address,
    contactEmail: contactFields.contactEmail,
    contactPerson: contactFields.contactPerson,
    contactWhere: fillContext(ctx, contactIntel.outreachGuidance),
    contactIntel,
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
    doToday,
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

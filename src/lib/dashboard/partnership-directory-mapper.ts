import { fillContext } from "@/lib/dashboard/fill-context";
import {
  applyContactIntelToOpportunityFields,
  buildCuratedContactIntel,
} from "@/lib/dashboard/partnership-contact-intelligence";
import type { DirectoryBusiness } from "@/lib/dashboard/partnership-directory-types";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { directoryTierToNumber } from "@/lib/dashboard/partnership-directory-types";
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

function scoresForDirectoryTier(tier: 1 | 2 | 3): {
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  priority: PartnershipOpportunity["priority"];
} {
  if (tier === 1) return { opportunityScore: 5, difficultyScore: 2, valueScore: 4, priority: "high" };
  if (tier === 2) return { opportunityScore: 4, difficultyScore: 3, valueScore: 4, priority: "medium" };
  return { opportunityScore: 3, difficultyScore: 4, valueScore: 5, priority: "explore" };
}

export function directoryBusinessToOpportunity(
  business: DirectoryBusiness,
  ctx: CreatorContext,
  locationLabel: string,
  idPrefix = "curated"
): PartnershipOpportunity {
  const tier = directoryTierToNumber(business.tier);
  const pitch = pitchForCategory(business.category);
  const scores = scoresForDirectoryTier(tier);
  const contactIntel = buildCuratedContactIntel(business);
  const contactFields = applyContactIntelToOpportunityFields(contactIntel);

  return {
    id: `${idPrefix}-${business.id}`,
    businessName: business.businessName,
    category: business.category,
    description: business.description,
    website: contactFields.website,
    instagram: contactFields.instagram,
    address: business.address,
    contactEmail: contactFields.contactEmail,
    contactPerson: contactFields.contactPerson,
    contactWhere: fillContext(ctx, contactIntel.outreachGuidance),
    contactIntel,
    outreachType: business.outreachType,
    pitchTemplateId: business.pitchTemplateId,
    pitchTemplateTitle: pitch.title,
    matchReason: fillContext(ctx, business.matchHint),
    whyYou: fillContext(ctx, business.whyYou),
    doToday: fillContext(ctx, business.doToday),
    priority: scores.priority,
    imageUrl: business.imageUrl,
    opportunityScore: business.opportunityScore,
    difficultyScore: business.difficultyScore,
    valueScore: business.valueScore,
    tierLabel: TIER_LABELS[tier],
    partnershipTier: tier,
    source: "curated",
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitch.title} — personalize with one detail from their Instagram and tie it to your {pillar} content.`
    ),
    searchLocation: locationLabel,
  };
}

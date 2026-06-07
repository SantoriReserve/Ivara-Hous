import { fillContext } from "@/lib/dashboard/fill-context";
import {
  matchDirectoryBusinesses,
  type DirectoryBusiness,
} from "@/lib/dashboard/partnership-directory";
import {
  enrichOpportunity,
  type PartnershipOpportunity,
} from "@/lib/dashboard/partnership-opportunities";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type LocationSearchInput = {
  country: string;
  state: string;
  city: string;
};

function buildLocationString(input: LocationSearchInput): string {
  const parts = [input.city, input.state, input.country].filter((p) => p.trim());
  return parts.join(", ");
}

function tierLabelFromScores(opportunityScore: number, difficultyScore: number): string {
  if (opportunityScore >= 5 && difficultyScore <= 2) {
    return "⭐⭐⭐⭐⭐ Best First Outreach";
  }
  if (opportunityScore >= 4 && difficultyScore <= 3) {
    return "⭐⭐⭐⭐ Great Portfolio Builder";
  }
  if (opportunityScore >= 3) {
    return "⭐⭐⭐ Solid Match";
  }
  if (difficultyScore >= 4) {
    return "⭐⭐ Stretch Opportunity";
  }
  return "⭐⭐⭐ Explore When Ready";
}

function directoryToOpportunity(
  business: DirectoryBusiness,
  ctx: CreatorContext,
  locationLabel: string
): PartnershipOpportunity {
  const pitchTitle = PITCH_TEMPLATE_TITLES[business.pitchTemplateId] ?? business.outreachType;

  const base: PartnershipOpportunity = {
    id: `${business.id}-${locationLabel.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    businessName: business.businessName,
    category: business.category,
    description: business.description,
    website: business.website,
    instagram: business.instagram,
    address: business.address,
    contactEmail: business.contactEmail,
    contactPerson: business.contactPerson,
    contactWhere: fillContext(ctx, business.contactWhere),
    outreachType: business.outreachType,
    pitchTemplateId: business.pitchTemplateId,
    pitchTemplateTitle: pitchTitle,
    matchReason: fillContext(ctx, business.matchHint),
    whyYou: fillContext(ctx, business.whyYou),
    doToday: fillContext(ctx, business.doToday),
    priority:
      business.opportunityScore >= 4 && business.difficultyScore <= 2
        ? "high"
        : business.opportunityScore >= 3
          ? "medium"
          : "explore",
    imageUrl: business.imageUrl,
    opportunityScore: business.opportunityScore,
    difficultyScore: business.difficultyScore,
    valueScore: business.valueScore,
    tierLabel: tierLabelFromScores(business.opportunityScore, business.difficultyScore),
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitchTitle} — personalize with one detail from their Instagram and tie it to your {pillar} content for {tier} audiences.`
    ),
    searchLocation: locationLabel,
  };

  return enrichOpportunity(base, ctx);
}

export function searchPartnershipOpportunities(
  ctx: CreatorContext,
  input: LocationSearchInput
): PartnershipOpportunity[] {
  const city = input.city.trim();
  const state = input.state.trim();
  const country = input.country.trim();
  const locationLabel = buildLocationString(input);

  if (!city && !state && !country) {
    return [];
  }

  const businesses = matchDirectoryBusinesses(input);

  if (businesses.length === 0) {
    return [];
  }

  const seen = new Set<string>();
  const results: PartnershipOpportunity[] = [];

  for (const business of businesses) {
    if (seen.has(business.id)) continue;
    seen.add(business.id);
    results.push(directoryToOpportunity(business, ctx, locationLabel));
  }

  return results;
}

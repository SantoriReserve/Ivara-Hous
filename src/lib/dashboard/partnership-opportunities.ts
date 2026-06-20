import { fillContext } from "@/lib/dashboard/fill-context";
import { matchDirectoryBusinesses } from "@/lib/dashboard/partnership-directory";
import { directoryBusinessToOpportunity } from "@/lib/dashboard/partnership-directory-mapper";
import {
  locationInputFromCreatorLocation,
} from "@/lib/dashboard/partnership-location";
import { isVerifiedPartnershipOpportunity } from "@/lib/dashboard/partnership-result-utils";
import { rankPartnershipOpportunities } from "@/lib/dashboard/partnership-stage-ranking";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

import type { PartnershipContactIntel } from "@/lib/dashboard/partnership-contact-types";

export type PartnershipOpportunity = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  website: string;
  instagram: string;
  address?: string;
  contactEmail?: string | null;
  contactPerson?: string | null;
  contactWhere: string;
  contactIntel?: PartnershipContactIntel;
  outreachType: string;
  matchReason: string;
  whyYou: string;
  doToday: string;
  priority: "high" | "medium" | "explore";
  pitchTemplateId: string;
  pitchTemplateTitle: string;
  imageUrl: string;
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  tierLabel: string;
  partnershipTier?: 1 | 2 | 3;
  source?: "curated" | "discovered";
  recommendedPitch: string;
  searchLocation?: string;
};

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

export function enrichOpportunity(
  opp: PartnershipOpportunity,
  ctx: CreatorContext
): PartnershipOpportunity {
  const pitchTitle = PITCH_TEMPLATE_TITLES[opp.pitchTemplateId] ?? opp.pitchTemplateTitle;
  return {
    ...opp,
    pitchTemplateTitle: pitchTitle,
    recommendedPitch:
      opp.recommendedPitch ||
      fillContext(
        ctx,
        `Use ${pitchTitle} — reference one specific detail from their Instagram and tie it to your {pillar} content for {tier} audiences.`
      ),
    tierLabel:
      opp.tierLabel ||
      tierLabelFromScores(opp.opportunityScore, opp.difficultyScore),
  };
}

function buildLocationLabel(input: { city: string; state: string; country: string }): string {
  return [input.city, input.state, input.country].filter((part) => part.trim()).join(", ");
}

function directoryMatchesForCreator(ctx: CreatorContext) {
  const locationInput = locationInputFromCreatorLocation(ctx.location);
  const locationLabel = buildLocationLabel(locationInput) || ctx.location;
  const businesses = matchDirectoryBusinesses(locationInput);
  return { businesses, locationLabel };
}

export function getPartnershipOpportunities(ctx: CreatorContext): PartnershipOpportunity[] {
  const { businesses, locationLabel } = directoryMatchesForCreator(ctx);

  const directoryOpportunities = businesses
    .map((business) =>
      enrichOpportunity(
        directoryBusinessToOpportunity(business, ctx, locationLabel, "pipeline"),
        ctx
      )
    )
    .filter(isVerifiedPartnershipOpportunity);

  const seen = new Set<string>();
  const combined: PartnershipOpportunity[] = [];

  for (const opp of directoryOpportunities) {
    const key = opp.businessName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(opp);
  }

  return rankPartnershipOpportunities(combined, ctx).slice(0, 30);
}

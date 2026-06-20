import { fillContext } from "@/lib/dashboard/fill-context";
import { getOpportunityImage } from "@/lib/dashboard/opportunity-images";
import { matchDirectoryBusinesses } from "@/lib/dashboard/partnership-directory";
import { directoryBusinessToOpportunity } from "@/lib/dashboard/partnership-directory-mapper";
import {
  locationInputFromCreatorLocation,
} from "@/lib/dashboard/partnership-location";
import { rankPartnershipOpportunities } from "@/lib/dashboard/partnership-stage-ranking";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

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
    imageUrl: opp.imageUrl || getOpportunityImage(opp.category),
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

function buildLocalOpportunities(ctx: CreatorContext): PartnershipOpportunity[] {
  const city = ctx.location.split(",")[0]?.trim() || ctx.location;

  const locals: PartnershipOpportunity[] = [
    {
      id: "local-boutique",
      businessName: `Independent boutique hotels in ${city}`,
      category: "Local Boutique Hotels",
      description: fillContext(
        ctx,
        "Independent boutique properties in {location} — fastest path to a first hosted stay or gifted collaboration."
      ),
      website: `https://www.google.com/search?q=${encodeURIComponent(`boutique hotel ${city}`)}`,
      instagram: `Instagram search: boutique hotel ${city}`,
      contactWhere: fillContext(
        ctx,
        "Instagram DMs to each hotel's official account — most respond faster than email"
      ),
      outreachType: "Hosted Stay Pitch",
      pitchTemplateId: "boutique-hotel",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES["boutique-hotel"],
      matchReason: fillContext(
        ctx,
        "Fastest path to a first collaboration: local boutique properties have lower barriers than global luxury brands."
      ),
      whyYou: fillContext(
        ctx,
        "You're a {stage} {niche} creator in {location} — local proof closes {gap} before you pitch {dream}."
      ),
      doToday: fillContext(
        ctx,
        "Find 3 boutique hotels in {location} on Instagram (under 25K followers, strong design). DM #1 using Boutique Hotel Pitch — mention their rooftop, suite, or lobby from a recent post."
      ),
      priority: "high",
      imageUrl: getOpportunityImage("Local Boutique Hotels"),
      opportunityScore: 5,
      difficultyScore: 2,
      valueScore: 4,
      partnershipTier: 1,
      tierLabel: tierLabelFromScores(5, 2),
      source: "curated",
      recommendedPitch: fillContext(
        ctx,
        "Use Boutique Hotel Pitch — open with one design detail from their feed and propose a 2-night content collaboration."
      ),
    },
    {
      id: "local-restaurant",
      businessName: `Chef-led restaurants in ${city}`,
      category: "Local Dining Partners",
      description: fillContext(
        ctx,
        "Chef-led dining rooms in {location} — same-week content you can attach to hotel pitches."
      ),
      website: `https://www.google.com/search?q=${encodeURIComponent(`fine dining ${city}`)}`,
      instagram: `Instagram search: tasting menu ${city}`,
      contactWhere: fillContext(
        ctx,
        "DM the restaurant's Instagram account — ask for the marketing or events contact"
      ),
      outreachType: "Restaurant Collaboration",
      pitchTemplateId: "restaurant",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES.restaurant,
      matchReason: fillContext(
        ctx,
        "A dining feature this week gives you portfolio content to attach to hotel pitches next week."
      ),
      whyYou: fillContext(
        ctx,
        "Your {pillar2} pillar and {style} style fit chef-led dining content in {location}."
      ),
      doToday: fillContext(
        ctx,
        "DM 2 restaurants with tasting menus. Offer: 1 reel + 5 stories for a hosted dinner. Link one live {pillar} post as proof."
      ),
      priority: "high",
      imageUrl: getOpportunityImage("Local Dining Partners"),
      opportunityScore: 5,
      difficultyScore: 2,
      valueScore: 4,
      partnershipTier: 1,
      tierLabel: tierLabelFromScores(5, 2),
      source: "curated",
      recommendedPitch: fillContext(
        ctx,
        "Use Restaurant Collaboration Pitch — name one dish from their Instagram and offer a reel + carousel from one visit."
      ),
    },
    {
      id: "local-cafe",
      businessName: `Design cafés in ${city}`,
      category: "Café UGC",
      description: fillContext(
        ctx,
        "Design-forward cafés in {location} — shoot and pitch UGC the same afternoon."
      ),
      website: `https://www.google.com/search?q=${encodeURIComponent(`specialty coffee ${city}`)}`,
      instagram: `Instagram search: café aesthetic ${city}`,
      contactWhere: fillContext(
        ctx,
        "DM the café account after you shoot — or ask the manager in person for the owner's email"
      ),
      outreachType: "Paid UGC Pitch",
      pitchTemplateId: "paid-ugc",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES["paid-ugc"],
      matchReason: fillContext(
        ctx,
        "Same-day content plus UGC pitch — portfolio asset and outreach practice in one afternoon."
      ),
      whyYou: fillContext(
        ctx,
        "Low-pressure paid or gifted work while you work through {challenge}."
      ),
      doToday: fillContext(
        ctx,
        "Shoot 15 photos + 3 clips at one design café. Send the Paid UGC Pitch the same day offering assets for their social."
      ),
      priority: "medium",
      imageUrl: getOpportunityImage("Café UGC"),
      opportunityScore: 4,
      difficultyScore: 1,
      valueScore: 3,
      partnershipTier: 1,
      tierLabel: tierLabelFromScores(4, 1),
      source: "curated",
      recommendedPitch: fillContext(
        ctx,
        "Use Paid UGC Pitch — offer 3 vertical clips and 15 photos with ninety-day usage rights."
      ),
    },
  ];

  return locals.map((opp) => enrichOpportunity(opp, ctx));
}

function directoryMatchesForCreator(ctx: CreatorContext) {
  const locationInput = locationInputFromCreatorLocation(ctx.location);
  const locationLabel = buildLocationLabel(locationInput) || ctx.location;

  let businesses = matchDirectoryBusinesses(locationInput);

  if (businesses.length < 12 && locationInput.country.trim()) {
    const countryMatches = matchDirectoryBusinesses({
      city: "",
      state: "",
      country: locationInput.country,
    });
    const seen = new Set(businesses.map((business) => business.id));
    for (const business of countryMatches) {
      if (seen.has(business.id)) continue;
      seen.add(business.id);
      businesses.push(business);
    }
  }

  const travelHint = `${ctx.upcomingTravel} ${ctx.dreamPartnerships}`.toLowerCase();
  if (businesses.length < 12 && travelHint.trim()) {
    const travelMatches = matchDirectoryBusinesses({
      city: travelHint.split(",")[0]?.trim() ?? "",
      state: "",
      country: "",
    });
    const seen = new Set(businesses.map((business) => business.id));
    for (const business of travelMatches) {
      if (seen.has(business.id)) continue;
      seen.add(business.id);
      businesses.push(business);
    }
  }

  return { businesses, locationLabel };
}

export function getPartnershipOpportunities(ctx: CreatorContext): PartnershipOpportunity[] {
  const { businesses, locationLabel } = directoryMatchesForCreator(ctx);

  const directoryOpportunities = businesses.map((business) =>
    enrichOpportunity(
      directoryBusinessToOpportunity(business, ctx, locationLabel, "pipeline"),
      ctx
    )
  );

  const seen = new Set<string>();
  const combined: PartnershipOpportunity[] = [];

  for (const opp of [...buildLocalOpportunities(ctx), ...directoryOpportunities]) {
    const key = opp.businessName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    combined.push(opp);
  }

  return rankPartnershipOpportunities(combined, ctx).slice(0, 24);
}

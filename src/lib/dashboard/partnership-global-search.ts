import { fillContext } from "@/lib/dashboard/fill-context";
import { editorialImageUrl } from "@/lib/dashboard/partnership-image-pool";
import {
  fetchOsmHospitalityPlaces,
  geocodeLocation,
  type OsmPlace,
} from "@/lib/dashboard/partnership-osm";
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
import type { LocationSearchInput } from "@/lib/dashboard/partnership-search";

export type PartnershipTier = 1 | 2 | 3;

const TIER_LABELS: Record<PartnershipTier, string> = {
  1: "Tier 1 — Easy Wins",
  2: "Tier 2 — Established Partners",
  3: "Tier 3 — Luxury & Stretch",
};

export function directoryTierToNumber(tier: DirectoryBusiness["tier"]): PartnershipTier {
  if (tier === "local") return 1;
  if (tier === "boutique") return 2;
  return 3;
}

function buildLocationString(input: LocationSearchInput): string {
  return [input.city, input.state, input.country].filter((p) => p.trim()).join(", ");
}

function pitchForCategory(category: string): { id: string; title: string } {
  if (category.includes("Restaurant") || category.includes("Café")) {
    return { id: "restaurant", title: PITCH_TEMPLATE_TITLES.restaurant ?? "Restaurant Feature Pitch" };
  }
  if (category.includes("Villa") || category.includes("Experience")) {
    return { id: "hosted-stay", title: PITCH_TEMPLATE_TITLES["hosted-stay"] ?? "Hosted Stay Pitch" };
  }
  return { id: "boutique-hotel", title: PITCH_TEMPLATE_TITLES["boutique-hotel"] ?? "Boutique Hotel Pitch" };
}

function scoresForTier(tier: PartnershipTier): {
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  priority: PartnershipOpportunity["priority"];
} {
  if (tier === 1) return { opportunityScore: 5, difficultyScore: 2, valueScore: 4, priority: "high" };
  if (tier === 2) return { opportunityScore: 4, difficultyScore: 3, valueScore: 4, priority: "medium" };
  return { opportunityScore: 3, difficultyScore: 4, valueScore: 5, priority: "explore" };
}

function tierDisplayLabel(tier: PartnershipTier): string {
  return TIER_LABELS[tier];
}

function directoryToOpportunity(
  business: DirectoryBusiness,
  ctx: CreatorContext,
  locationLabel: string
): PartnershipOpportunity {
  const tier = directoryTierToNumber(business.tier);
  const pitch = pitchForCategory(business.category);
  const scores = scoresForTier(tier);

  const base: PartnershipOpportunity = {
    id: `curated-${business.id}`,
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
    pitchTemplateTitle: pitch.title,
    matchReason: fillContext(ctx, business.matchHint),
    whyYou: fillContext(ctx, business.whyYou),
    doToday: fillContext(ctx, business.doToday),
    priority: scores.priority,
    imageUrl: business.imageUrl,
    opportunityScore: business.opportunityScore,
    difficultyScore: business.difficultyScore,
    valueScore: business.valueScore,
    tierLabel: tierDisplayLabel(tier),
    partnershipTier: tier,
    source: "curated",
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitch.title} — personalize with one detail from their Instagram and tie it to your {pillar} content.`
    ),
    searchLocation: locationLabel,
  };

  return enrichOpportunity(base, ctx);
}

async function osmToOpportunity(
  place: OsmPlace,
  ctx: CreatorContext,
  locationLabel: string
): Promise<PartnershipOpportunity> {
  const pitch = pitchForCategory(place.category);
  const scores = scoresForTier(place.tier);
  const website = place.website?.startsWith("http")
    ? place.website
    : place.website
      ? `https://${place.website}`
      : `https://www.google.com/search?q=${encodeURIComponent(`${place.name} ${locationLabel}`)}`;

  const imageUrl = editorialImageUrl(`osm-${place.osmId}-${place.category}`, 800, 520);

  const instagram = `Instagram — search "${place.name}" in ${locationLabel}`;
  const contactWhere = place.email
    ? `Email ${place.email} — or find ${place.name} on Instagram`
    : place.phone
      ? `Call ${place.phone} — or DM on Instagram after verifying handle`
      : `Find ${place.name} on Instagram — search name + city before pitching`;

  const base: PartnershipOpportunity = {
    id: `osm-${place.osmId.replace("/", "-")}`,
    businessName: place.name,
    category: place.category,
    description: `${place.name} is a verified ${place.category.toLowerCase()} in ${locationLabel} — discovered via OpenStreetMap for creator partnerships.`,
    website,
    instagram,
    address: place.address,
    contactEmail: place.email,
    contactPerson: null,
    contactWhere: fillContext(ctx, contactWhere),
    outreachType: pitch.title,
    pitchTemplateId: pitch.id,
    pitchTemplateTitle: pitch.title,
    matchReason: fillContext(
      ctx,
      `Global discovery match in ${locationLabel} for {niche} creators building {tier} proof.`
    ),
    whyYou: fillContext(
      ctx,
      `${place.name} is a Tier ${place.tier} outreach target for {stage} creators in {location}.`
    ),
    doToday: fillContext(
      ctx,
      `Verify their Instagram handle, then send ${pitch.title} referencing one visual detail from their online presence.`
    ),
    priority: scores.priority,
    imageUrl,
    opportunityScore: scores.opportunityScore,
    difficultyScore: scores.difficultyScore,
    valueScore: scores.valueScore,
    tierLabel: tierDisplayLabel(place.tier),
    partnershipTier: place.tier,
    source: "discovered",
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitch.title} — verify the property's Instagram first, then personalize for {pillar} content.`
    ),
    searchLocation: locationLabel,
  };

  return enrichOpportunity(base, ctx);
}

const TARGET_RESULTS = 50;

export async function searchPartnershipOpportunitiesGlobal(
  ctx: CreatorContext,
  input: LocationSearchInput
): Promise<PartnershipOpportunity[]> {
  const locationLabel = buildLocationString(input);
  if (!locationLabel) return [];

  const curated = matchDirectoryBusinesses(input);
  const seenNames = new Set<string>();
  const results: PartnershipOpportunity[] = [];

  for (const business of curated) {
    const key = business.businessName.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    results.push(directoryToOpportunity(business, ctx, locationLabel));
  }

  const shouldDiscover = input.city.trim().length > 0;
  if (shouldDiscover && results.length < TARGET_RESULTS) {
    const geo = await geocodeLocation(input);
    if (geo) {
      const osmPlaces = await fetchOsmHospitalityPlaces(geo, TARGET_RESULTS - results.length + 10);
      const osmOpps = await Promise.all(
        osmPlaces.map((place) => osmToOpportunity(place, ctx, locationLabel))
      );
      for (const opp of osmOpps) {
        const key = opp.businessName.toLowerCase();
        if (seenNames.has(key)) continue;
        seenNames.add(key);
        results.push(opp);
        if (results.length >= TARGET_RESULTS) break;
      }
    }
  }

  return results
    .sort((a, b) => (a.partnershipTier ?? 2) - (b.partnershipTier ?? 2))
    .slice(0, TARGET_RESULTS);
}

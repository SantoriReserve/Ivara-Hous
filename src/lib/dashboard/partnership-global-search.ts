import { fillContext } from "@/lib/dashboard/fill-context";
import { getCategoryImageAsset } from "@/lib/dashboard/dashboard-images";
import { directoryBusinessToOpportunity } from "@/lib/dashboard/partnership-directory-mapper";
import { matchDirectoryBusinesses } from "@/lib/dashboard/partnership-directory";
import { withTimeout } from "@/lib/dashboard/partnership-fetch-utils";
import {
  geocodeInputFromSearch,
  osmPlaceMatchesResolvedLocation,
  resolveLocationSearch,
} from "@/lib/dashboard/partnership-location";
import {
  enrichOpportunity,
  type PartnershipOpportunity,
} from "@/lib/dashboard/partnership-opportunities";
import {
  fetchOsmHospitalityPlaces,
  fetchWikidataImageUrl,
  geocodeLocation,
  type OsmPlace,
} from "@/lib/dashboard/partnership-osm";
import { getVerifiedPropertyImageUrl } from "@/lib/dashboard/partnership-property-images";
import { isVerifiedPartnershipOpportunity } from "@/lib/dashboard/partnership-result-utils";
import { rankPartnershipOpportunities } from "@/lib/dashboard/partnership-stage-ranking";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";
import type { LocationSearchInput } from "@/lib/dashboard/partnership-search";

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

async function osmImageUrl(place: OsmPlace): Promise<string> {
  if (place.wikidata) {
    const wikidataImage = await withTimeout(fetchWikidataImageUrl(place.wikidata), 2500, null);
    if (wikidataImage) return wikidataImage;
  }
  return getCategoryImageAsset(place.category, `osm-${place.osmId}-${place.category}`).src;
}

function osmToOpportunity(
  place: OsmPlace,
  ctx: CreatorContext,
  locationLabel: string,
  imageUrl: string
): PartnershipOpportunity {
  const pitch = pitchForCategory(place.category);
  const scores = scoresForTier(place.tier);
  const website = place.website ?? "";
  const instagram = place.instagram ?? "Not available";

  const contactWhere = place.email
    ? `Email ${place.email}${place.instagram ? ` — or DM ${place.instagram}` : ""}`
    : place.phone
      ? `Call ${place.phone}${place.instagram ? ` — or DM ${place.instagram}` : ""}`
      : place.instagram
        ? `DM ${place.instagram} — or use the website contact form`
        : website
          ? `Use the contact form on ${website.replace(/^https?:\/\/(www\.)?/, "")}`
          : "Contact details on property website";

  const base: PartnershipOpportunity = {
    id: `osm-${place.osmId.replace("/", "-")}`,
    businessName: place.name,
    category: place.category,
    description: `${place.name} is a verified ${place.category.toLowerCase()} in ${locationLabel} — matched to your creator stage for hospitality partnerships.`,
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
      `Verified ${place.category.toLowerCase()} in ${locationLabel} for {niche} creators building {tier} proof.`
    ),
    whyYou: fillContext(
      ctx,
      `${place.name} is a Tier ${place.tier} outreach target for {stage} creators in {location}.`
    ),
    doToday: fillContext(
      ctx,
      place.instagram
        ? `Send ${pitch.title} to ${place.instagram}. Open with one visual detail from their feed and tie it to your {pillar} content.`
        : `Send ${pitch.title} via the website contact form. Reference one specific design or experience detail from ${place.name}.`
    ),
    priority: scores.priority,
    imageUrl,
    opportunityScore: scores.opportunityScore,
    difficultyScore: scores.difficultyScore,
    valueScore: scores.valueScore,
    tierLabel: TIER_LABELS[place.tier],
    partnershipTier: place.tier,
    source: "discovered",
    recommendedPitch: fillContext(
      ctx,
      `Use ${pitch.title} — personalize for {pillar} content and propose a clear deliverable package.`
    ),
    searchLocation: locationLabel,
  };

  return enrichOpportunity(base, ctx);
}

const TARGET_RESULTS = 30;

export async function searchPartnershipOpportunitiesGlobal(
  ctx: CreatorContext,
  input: LocationSearchInput
): Promise<PartnershipOpportunity[]> {
  const resolved = resolveLocationSearch(input);
  if (!resolved.label && !resolved.city && !resolved.state && !resolved.country) return [];

  const geocodeInput = geocodeInputFromSearch(input, resolved);
  const curated = matchDirectoryBusinesses(input);
  const seenNames = new Set<string>();
  const results: PartnershipOpportunity[] = [];

  for (const business of curated) {
    const key = business.businessName.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);

    const imageUrl =
      getVerifiedPropertyImageUrl(business.id) ?? business.imageUrl;

    const opp = enrichOpportunity(
      {
        ...directoryBusinessToOpportunity(business, ctx, resolved.label || resolved.cityLabel),
        imageUrl,
      },
      ctx
    );

    if (isVerifiedPartnershipOpportunity(opp)) {
      results.push(opp);
    }
  }

  const shouldDiscover =
    Boolean(resolved.city || resolved.state || resolved.country || geocodeInput.city || geocodeInput.country) &&
    results.length < TARGET_RESULTS;

  if (shouldDiscover) {
    const geo = await withTimeout(
      geocodeLocation(geocodeInput, resolved.city),
      8000,
      null
    );

    if (geo) {
      const osmPlaces = await withTimeout(
        fetchOsmHospitalityPlaces(geo, Math.max(TARGET_RESULTS - results.length + 10, 20)),
        12000,
        []
      );

      for (const place of osmPlaces) {
        if (!osmPlaceMatchesResolvedLocation(place, geo, resolved)) continue;

        const key = place.name.toLowerCase();
        if (seenNames.has(key)) continue;
        seenNames.add(key);

        const imageUrl = await osmImageUrl(place);
        const opp = osmToOpportunity(place, ctx, resolved.label || geo.displayName, imageUrl);
        if (!isVerifiedPartnershipOpportunity(opp)) continue;

        results.push(opp);
        if (results.length >= TARGET_RESULTS) break;
      }
    }
  }

  return rankPartnershipOpportunities(results, ctx).slice(0, TARGET_RESULTS);
}

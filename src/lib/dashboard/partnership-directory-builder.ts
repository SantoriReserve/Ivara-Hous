import {
  businessMatchesSearch,
  resolveGeoKeys,
  SUPPORTED_CITY_LABELS,
} from "@/lib/dashboard/partnership-geo";
import { getPartnershipImageUrl } from "@/lib/dashboard/dashboard-images";
import {
  RAW_PARTNERSHIP_ENTRIES,
  type RawPartnershipEntry,
} from "@/lib/dashboard/partnership-directory-raw";
import type { DirectoryBusiness } from "@/lib/dashboard/partnership-directory-types";

const OUTREACH_BY_PITCH: Record<string, string> = {
  "boutique-hotel": "Hosted Stay Pitch",
  "hosted-stay": "Hosted Stay Pitch",
  restaurant: "Restaurant Feature Pitch",
  "ugc-pitch": "UGC Deliverables Pitch",
};

function contactWhere(entry: RawPartnershipEntry): string {
  if (entry.contactEmail && entry.instagram) {
    return `Email ${entry.contactEmail} — or DM ${entry.instagram}`;
  }
  if (entry.contactEmail) {
    return `Email ${entry.contactEmail} — or use the website contact form`;
  }
  if (entry.contactPerson && entry.instagram) {
    return `${entry.contactPerson} — or DM ${entry.instagram}`;
  }
  if (entry.contactPerson) {
    return entry.contactPerson;
  }
  if (entry.instagram) {
    return `DM ${entry.instagram} — or use the website contact form`;
  }
  return "Use the website contact form";
}

function buildDescription(entry: RawPartnershipEntry): string {
  const location = SUPPORTED_CITY_LABELS[entry.city] ?? entry.city;
  return `${entry.businessName} is a ${entry.category.toLowerCase()} in ${location} with a strong hospitality presence and partnership potential for creators.`;
}

function buildWhyYou(entry: RawPartnershipEntry): string {
  const tier =
    entry.tier === "local"
      ? "accessible first outreach"
      : entry.tier === "boutique"
        ? "portfolio-building partnership"
        : "stretch partnership";
  return `${entry.businessName} is a ${tier} target for {stage} {niche} creators building {tier} hospitality proof toward {dream}.`;
}

function buildDoToday(entry: RawPartnershipEntry): string {
  const pitch = OUTREACH_BY_PITCH[entry.pitchTemplateId] ?? "Hosted Stay Pitch";
  if (entry.instagram) {
    return `Send the ${pitch} to ${entry.instagram}. Reference one detail from their feed and tie it to your {pillar} content for {travel}.`;
  }
  return `Send the ${pitch} via the website contact form. Reference one specific visual detail from ${entry.businessName} and tie it to your {pillar} content.`;
}

function buildMatchHint(entry: RawPartnershipEntry): string {
  const location = SUPPORTED_CITY_LABELS[entry.city] ?? entry.city;
  return `Location-specific match in ${location} for creators in {location} targeting {tier} partnerships.`;
}

export function buildDirectoryBusiness(entry: RawPartnershipEntry): DirectoryBusiness {
  return {
    id: entry.id,
    businessName: entry.businessName,
    category: entry.category,
    city: entry.city,
    state: entry.state,
    country: entry.country,
    tier: entry.tier,
    website: entry.website,
    instagram: entry.instagram,
    address: entry.address,
    contactEmail: entry.contactEmail,
    contactPerson: entry.contactPerson,
    contactWhere: contactWhere(entry),
    description: buildDescription(entry),
    outreachType: OUTREACH_BY_PITCH[entry.pitchTemplateId] ?? "Hosted Stay Pitch",
    pitchTemplateId: entry.pitchTemplateId,
    whyYou: buildWhyYou(entry),
    doToday: buildDoToday(entry),
    matchHint: buildMatchHint(entry),
    opportunityScore: entry.opportunityScore,
    difficultyScore: entry.difficultyScore,
    valueScore: entry.valueScore,
    imageUrl: getPartnershipImageUrl(entry.category, entry.id),
  };
}

export const PARTNERSHIP_DIRECTORY: DirectoryBusiness[] =
  RAW_PARTNERSHIP_ENTRIES.map(buildDirectoryBusiness);

export function matchDirectoryBusinesses(input: {
  country: string;
  state: string;
  city: string;
}): DirectoryBusiness[] {
  const search = resolveGeoKeys(input);
  const hasAnyField = Boolean(input.city.trim() || input.state.trim() || input.country.trim());
  if (!hasAnyField) return [];

  const matched = PARTNERSHIP_DIRECTORY.filter((business) =>
    businessMatchesSearch(business, search)
  );

  const tierOrder = { local: 0, boutique: 1, stretch: 2 };
  return matched.sort((a, b) => {
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return b.opportunityScore - a.opportunityScore;
  });
}

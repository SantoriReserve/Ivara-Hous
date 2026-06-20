import { directoryBusinessToOpportunity } from "@/lib/dashboard/partnership-directory-mapper";
import { matchDirectoryBusinesses } from "@/lib/dashboard/partnership-directory";
import {
  enrichOpportunity,
  type PartnershipOpportunity,
} from "@/lib/dashboard/partnership-opportunities";
import { rankPartnershipOpportunities } from "@/lib/dashboard/partnership-stage-ranking";
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
    results.push(
      enrichOpportunity(
        directoryBusinessToOpportunity(business, ctx, locationLabel),
        ctx
      )
    );
  }

  return rankPartnershipOpportunities(results, ctx);
}

"use client";

import { useMemo, useState } from "react";
import { PartnershipOpportunitiesView } from "@/components/dashboard/PartnershipOpportunitiesView";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import { searchPartnershipOpportunities } from "@/lib/dashboard/partnership-search";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

type PartnershipDiscoveryProps = {
  creatorContext: CreatorContext;
  curatedOpportunities: PartnershipOpportunity[];
  defaultCountry?: string;
  defaultState?: string;
  defaultCity?: string;
};

function parseLocation(location: string): { city: string; state: string; country: string } {
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length >= 3) {
    return { city: parts[0] ?? "", state: parts[1] ?? "", country: parts[2] ?? "" };
  }
  if (parts.length === 2) {
    return { city: parts[0] ?? "", state: "", country: parts[1] ?? "" };
  }
  return { city: parts[0] ?? "", state: "", country: "" };
}

export function PartnershipDiscovery({
  creatorContext,
  curatedOpportunities,
  defaultCountry = "",
  defaultState = "",
  defaultCity = "",
}: PartnershipDiscoveryProps) {
  const defaults = useMemo(
    () =>
      defaultCity || defaultState || defaultCountry
        ? { city: defaultCity, state: defaultState, country: defaultCountry }
        : parseLocation(creatorContext.location),
    [creatorContext.location, defaultCity, defaultState, defaultCountry]
  );

  const [country, setCountry] = useState(defaults.country);
  const [state, setState] = useState(defaults.state);
  const [city, setCity] = useState(defaults.city);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchResults, setSearchResults] = useState<PartnershipOpportunity[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = searchPartnershipOpportunities(creatorContext, { country, state, city });
    setSearchResults(results);
    setHasSearched(true);
  };

  return (
    <div className="space-y-10">
      <section className="border border-black/10 bg-black/[0.02] p-6 md:p-8">
        <p className="luxury-label mb-2 text-gray-muted">Opportunity Discovery</p>
        <h3 className="font-serif text-2xl text-black">Search by location</h3>
        <p className="mt-2 max-w-2xl font-sans text-sm text-gray-mid">
          Generate partnership targets for any market — boutique hotels, villas, restaurants,
          cafés, and tourism brands matched to your {creatorContext.niche} positioning.
        </p>

        <form onSubmit={handleSearch} className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="luxury-label mb-2 block text-gray-muted">Country</span>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="United States"
              className="w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="block">
            <span className="luxury-label mb-2 block text-gray-muted">State / Region</span>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="New York"
              className="w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none focus:border-black"
            />
          </label>
          <label className="block">
            <span className="luxury-label mb-2 block text-gray-muted">City</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="New York City"
              className="w-full border border-black/20 bg-white px-4 py-3 font-sans text-sm text-black outline-none focus:border-black"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="bg-black px-8 py-3 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80"
            >
              Discover Opportunities
            </button>
          </div>
        </form>
      </section>

      {hasSearched && (
        <section className="space-y-6">
          <div>
            <p className="luxury-label mb-2 text-gray-muted">Search Results</p>
            <h3 className="font-serif text-2xl text-black">
              {searchResults.length} opportunities in {[city, state, country].filter(Boolean).join(", ")}
            </h3>
            <p className="mt-2 font-sans text-sm text-gray-mid">
              Each card includes contact details, match reasoning, and a recommended pitch.
            </p>
          </div>
          {searchResults.length > 0 ? (
            <PartnershipOpportunitiesView opportunities={searchResults} showScores />
          ) : (
            <p className="font-sans text-sm text-gray-mid">
              Enter at least a city, state, or country to generate opportunities.
            </p>
          )}
        </section>
      )}

      <section className="space-y-6">
        <div>
          <p className="luxury-label mb-2 text-gray-muted">Curated for You</p>
          <h3 className="font-serif text-2xl text-black">Your recommended pipeline</h3>
          <p className="mt-2 font-sans text-sm text-gray-mid">
            Personalized targets based on your assessment — local fast wins plus dream-brand stretch
            opportunities.
          </p>
        </div>
        <PartnershipOpportunitiesView opportunities={curatedOpportunities} showScores />
      </section>
    </div>
  );
}

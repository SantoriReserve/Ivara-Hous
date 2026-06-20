"use client";

import { useMemo, useState, useTransition } from "react";
import { searchPartnershipsByLocation } from "@/app/actions/partnership-search-actions";
import { PartnershipOpportunitiesView } from "@/components/dashboard/PartnershipOpportunitiesView";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";

type PartnershipDiscoveryProps = {
  creatorContext: { niche: string; location: string };
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
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    startTransition(async () => {
      const result = await searchPartnershipsByLocation({ country, state, city });
      if (!result.success) {
        setSearchError(result.error);
        setSearchResults([]);
      } else {
        setSearchResults(result.opportunities);
      }
      setHasSearched(true);
    });
  };

  const curatedCount = searchResults.filter((o) => o.source === "curated").length;
  const discoveredCount = searchResults.filter((o) => o.source === "discovered").length;

  return (
    <div className="space-y-10">
      <section className="border border-black/10 bg-black/[0.02] p-6 md:p-8">
        <p className="luxury-label mb-2 text-gray-muted">Opportunity Discovery</p>
        <h3 className="font-serif text-2xl text-black">Search by location</h3>
        <p className="mt-2 max-w-2xl font-sans text-sm text-gray-mid">
          Search any city, state, or country — curated independent properties plus live hospitality
          discovery for hotels, restaurants, cafés, wellness, and experiences matched to your{" "}
          {creatorContext.niche} positioning and creator stage.
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
              disabled={isPending}
              className="bg-black px-8 py-3 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              {isPending ? "Discovering…" : "Discover Opportunities"}
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
              {curatedCount > 0 && `${curatedCount} curated premium targets`}
              {curatedCount > 0 && discoveredCount > 0 && " · "}
              {discoveredCount > 0 && `${discoveredCount} live global discoveries`}
              {searchResults.length === 0 && "No results — try adding a city name."}
            </p>
            {searchError && (
              <p className="mt-2 font-sans text-sm text-red-700">{searchError}</p>
            )}
          </div>
          {searchResults.length > 0 ? (
            <PartnershipOpportunitiesView
              opportunities={searchResults}
              showScores
              groupByTier
            />
          ) : (
            <p className="font-sans text-sm text-gray-mid">
              Enter a city with country or state for the most accurate results. Try Miami, Barcelona,
              or Cape Town — boutique and independent properties appear first for early-stage creators.
            </p>
          )}
        </section>
      )}

      <section className="space-y-6">
        <div>
          <p className="luxury-label mb-2 text-gray-muted">Curated for You</p>
          <h3 className="font-serif text-2xl text-black">Your recommended pipeline</h3>
          <p className="mt-2 font-sans text-sm text-gray-mid">
            Stage-matched targets from your location — boutique and independent properties first,
            with stretch luxury opportunities balanced for where you are now.
          </p>
        </div>
        <PartnershipOpportunitiesView opportunities={curatedOpportunities} showScores />
      </section>
    </div>
  );
}

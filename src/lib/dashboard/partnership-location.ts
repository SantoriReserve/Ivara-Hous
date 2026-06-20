import {
  type GeoKeys,
  resolveGeoKeys,
  slugifyGeo,
} from "@/lib/dashboard/partnership-geo";
import type { LocationSearchInput } from "@/lib/dashboard/partnership-search";

export type ResolvedLocationSearch = GeoKeys & {
  label: string;
  cityLabel: string;
  tokens: string[];
};

const CITY_META: Record<string, { state: string; country: string; label: string }> = {
  miami: { state: "florida", country: "united-states", label: "Miami, FL" },
  "new-york-city": { state: "new-york", country: "united-states", label: "New York City, NY" },
  "los-angeles": { state: "california", country: "united-states", label: "Los Angeles, CA" },
  "san-francisco": { state: "california", country: "united-states", label: "San Francisco, CA" },
  paris: { state: "ile-de-france", country: "france", label: "Paris, France" },
  london: { state: "england", country: "united-kingdom", label: "London, UK" },
  barcelona: { state: "catalonia", country: "spain", label: "Barcelona, Spain" },
  dubai: { state: "dubai", country: "united-arab-emirates", label: "Dubai, UAE" },
  tokyo: { state: "tokyo", country: "japan", label: "Tokyo, Japan" },
  tulum: { state: "quintana-roo", country: "mexico", label: "Tulum, Mexico" },
  "mexico-city": { state: "cdmx", country: "mexico", label: "Mexico City, Mexico" },
  "buenos-aires": { state: "buenos-aires", country: "argentina", label: "Buenos Aires, Argentina" },
  "punta-cana": { state: "la-altagracia", country: "dominican-republic", label: "Punta Cana, DR" },
  "cape-town": { state: "western-cape", country: "south-africa", label: "Cape Town, South Africa" },
  prague: { state: "prague", country: "czech-republic", label: "Prague, Czech Republic" },
};

const COUNTRY_GEOCODE_NAMES: Record<string, string> = {
  "united-states": "United States",
  "united-kingdom": "United Kingdom",
  "united-arab-emirates": "United Arab Emirates",
  "dominican-republic": "Dominican Republic",
  "south-africa": "South Africa",
  "czech-republic": "Czech Republic",
  spain: "Spain",
  france: "France",
  italy: "Italy",
  mexico: "Mexico",
  morocco: "Morocco",
  japan: "Japan",
  singapore: "Singapore",
  indonesia: "Indonesia",
  thailand: "Thailand",
  qatar: "Qatar",
  australia: "Australia",
  argentina: "Argentina",
  brazil: "Brazil",
  colombia: "Colombia",
  bahamas: "Bahamas",
  netherlands: "Netherlands",
  portugal: "Portugal",
  germany: "Germany",
  denmark: "Denmark",
};

function titleCaseGeo(value: string): string {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function geocodeInputFromSearch(
  input: LocationSearchInput,
  resolved: ResolvedLocationSearch
): { city: string; state: string; country: string } {
  const meta = resolved.city ? CITY_META[resolved.city] : undefined;
  return {
    city: input.city.trim() || meta?.label.split(",")[0]?.trim() || "",
    state: input.state.trim() || titleCaseGeo(resolved.state),
    country:
      input.country.trim() ||
      COUNTRY_GEOCODE_NAMES[resolved.country] ||
      titleCaseGeo(resolved.country),
  };
}

export function resolveLocationSearch(input: LocationSearchInput): ResolvedLocationSearch {
  const resolved = resolveGeoKeys(input);
  const meta = resolved.city ? CITY_META[resolved.city] : undefined;

  const city = resolved.city;
  const state = resolved.state || meta?.state || "";
  const country = resolved.country || meta?.country || "";

  const labelParts = [
    input.city.trim() || meta?.label?.split(",")[0] || "",
    input.state.trim() || undefined,
    input.country.trim() || undefined,
  ].filter(Boolean);

  const label = labelParts.join(", ");
  const cityLabel = meta?.label ?? label;

  const tokens = [city, state, country, slugifyGeo(input.city), slugifyGeo(input.state), slugifyGeo(input.country)]
    .filter(Boolean)
    .flatMap((token) => token.split("-"))
    .filter((token) => token.length > 2);

  return { city, state, country, label, cityLabel, tokens };
}

export function locationInputFromCreatorLocation(location: string): LocationSearchInput {
  const parts = location.split(",").map((part) => part.trim());
  if (parts.length >= 3) {
    return { city: parts[0] ?? "", state: parts[1] ?? "", country: parts.slice(2).join(", ") };
  }
  if (parts.length === 2) {
    return { city: parts[0] ?? "", state: "", country: parts[1] ?? "" };
  }
  return { city: parts[0] ?? "", state: "", country: "" };
}

export function addressMatchesResolvedLocation(
  address: string,
  resolved: ResolvedLocationSearch
): boolean {
  if (!resolved.city && !resolved.state && !resolved.country) return true;
  if (
    address === "Address on property website" ||
    address.length < 8
  ) {
    return Boolean(resolved.city || resolved.state || resolved.country);
  }

  const haystack = slugifyGeo(address);
  if (resolved.city && haystack.includes(resolved.city.replace(/-/g, ""))) return true;
  if (resolved.city && haystack.includes(resolved.city)) return true;

  const cityWords = resolved.city.split("-").filter((part) => part.length > 2);
  if (cityWords.length > 0 && cityWords.every((part) => haystack.includes(part))) return true;

  if (resolved.state && haystack.includes(resolved.state)) return true;
  if (resolved.country && haystack.includes(resolved.country)) return true;

  for (const token of resolved.tokens) {
    if (token.length > 3 && haystack.includes(token)) return true;
  }

  return !resolved.city;
}

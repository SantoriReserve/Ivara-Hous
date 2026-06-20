/**
 * Global hospitality discovery via OpenStreetMap (Nominatim + Overpass).
 * Supplements the curated directory for any city worldwide.
 */

import { fetchWithTimeout } from "@/lib/dashboard/partnership-fetch-utils";
import { normalizeInstagramHandle, normalizeWebsiteUrl } from "@/lib/dashboard/partnership-result-utils";
import { isMajorChainBrand } from "@/lib/dashboard/partnership-stage-ranking";

export type OsmPlace = {
  osmId: string;
  name: string;
  category: string;
  address: string;
  website: string | null;
  instagram: string | null;
  email: string | null;
  phone: string | null;
  wikidata: string | null;
  tier: 1 | 2 | 3;
  lat: number;
  lon: number;
};

export type GeocodeResult = {
  lat: number;
  lon: number;
  displayName: string;
  city?: string;
  state?: string;
  country?: string;
};

const NOMINATIM_HEADERS = {
  "User-Agent": "IvaraHous/1.0 (partnership-discovery; contact@ivarahous.com)",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeLocation(input: {
  city: string;
  state: string;
  country: string;
}): Promise<GeocodeResult | null> {
  const city = input.city.trim();
  const state = input.state.trim();
  const country = input.country.trim();
  if (!city && !state && !country) return null;

  const params = new URLSearchParams({
    format: "json",
    limit: "1",
    addressdetails: "1",
  });

  if (city) params.set("city", city);
  if (state) params.set("state", state);
  if (country) params.set("country", country);
  if (!city && !state && country) params.set("country", country);
  if (!params.has("city") && !params.has("state") && !params.has("country")) {
    params.set("q", [city, state, country].filter(Boolean).join(", "));
  }

  await sleep(1100);
  const res = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: NOMINATIM_HEADERS, timeoutMs: 8000 }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    address?: Record<string, string>;
  }>;
  const hit = data[0];
  if (!hit) return null;

  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    displayName: hit.display_name,
    city: hit.address?.city ?? hit.address?.town ?? hit.address?.village,
    state: hit.address?.state,
    country: hit.address?.country,
  };
}

function buildAddress(tags: Record<string, string>): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] ?? tags["addr:town"] ?? tags["addr:place"],
    tags["addr:state"],
    tags["addr:country"],
  ].filter(Boolean);
  return parts.join(", ") || tags["addr:place"] || "Address on property website";
}

function inferTier(name: string, category: string, tags: Record<string, string>): 1 | 2 | 3 {
  const lower = name.toLowerCase();
  const stars = Number(tags.stars ?? tags["tourism:hotel:stars"] ?? 0);

  if (isMajorChainBrand(name)) {
    return stars >= 5 ? 3 : 2;
  }

  const luxuryWords = ["palace", "grand hotel", "collection", "luxury", "resort &"];
  const chainWords = ["marriott", "hilton", "hyatt", "ihg", "accor", "wyndham", "radisson"];

  if (luxuryWords.some((word) => lower.includes(word)) && stars >= 5) return 3;
  if (chainWords.some((word) => lower.includes(word)) || stars >= 4) return 2;
  if (category.includes("Restaurant") || category.includes("Café")) return 1;
  if (category.includes("Experience")) return 2;
  if (category.includes("Boutique")) return 1;
  return 1;
}

function categoryFromTags(tags: Record<string, string>): string {
  if (tags.tourism === "hotel" || tags.tourism === "guest_house") {
    if (tags.stars && Number(tags.stars) >= 4 && isMajorChainBrand(tags.name ?? "")) {
      return "Luxury Hotel";
    }
    if (tags.stars && Number(tags.stars) >= 4) return "Small Luxury Hotel";
    return "Boutique Hotel";
  }
  if (tags.tourism === "museum" || tags.tourism === "attraction" || tags.tourism === "theme_park") {
    return "Hospitality Experience";
  }
  if (tags.amenity === "restaurant") return "Restaurant";
  if (tags.amenity === "cafe") return "Café";
  if (tags.tourism === "hostel") return "Boutique Hotel";
  if (tags.tourism === "apartment") return "Luxury Villa";
  return "Hospitality Brand";
}

function parseOsmElement(
  el: {
    id: number;
    lat?: number;
    lon?: number;
    center?: { lat: number; lon: number };
    tags?: Record<string, string>;
  },
  type: "node" | "way"
): OsmPlace | null {
  const tags = el.tags ?? {};
  const name = tags.name ?? tags["name:en"];
  if (!name || name.length < 2) return null;
  if (tags.disused === "yes" || tags.abandoned === "yes") return null;
  if (tags.amenity === "fast_food") return null;

  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  const category = categoryFromTags(tags);
  const website = normalizeWebsiteUrl(tags.website ?? tags["contact:website"] ?? null);
  const instagram = normalizeInstagramHandle(tags);

  return {
    osmId: `${type}/${el.id}`,
    name,
    category,
    address: buildAddress(tags),
    website,
    instagram,
    email: tags.email ?? tags["contact:email"] ?? null,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    wikidata: tags.wikidata ?? null,
    tier: inferTier(name, category, tags),
    lat,
    lon,
  };
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function fetchOsmHospitalityPlaces(
  geo: GeocodeResult,
  limit = 80
): Promise<OsmPlace[]> {
  const radius = 18000;
  const query = `
    [out:json][timeout:12];
    (
      node["tourism"~"hotel|guest_house|hostel|museum|attraction|apartment"](around:${radius},${geo.lat},${geo.lon});
      way["tourism"~"hotel|guest_house|hostel|museum|attraction|apartment"](around:${radius},${geo.lat},${geo.lon});
      node["amenity"~"restaurant|cafe"](around:${radius},${geo.lat},${geo.lon});
      way["amenity"~"restaurant|cafe"](around:${radius},${geo.lat},${geo.lon});
    );
    out center ${limit + 40};
  `;

  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let res: Response | null = null;
  for (const endpoint of endpoints) {
    const attempt = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": NOMINATIM_HEADERS["User-Agent"],
        Accept: "application/json",
      },
      body: new URLSearchParams({ data: query }).toString(),
      timeoutMs: 12000,
    });
    if (attempt.ok) {
      res = attempt;
      break;
    }
  }

  if (!res?.ok) return [];

  const json = (await res.json()) as {
    elements: Array<{
      id: number;
      type: "node" | "way";
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const places: OsmPlace[] = [];
  const seen = new Set<string>();

  for (const el of json.elements ?? []) {
    const parsed = parseOsmElement(el, el.type === "way" ? "way" : "node");
    if (!parsed) continue;
    if (distanceKm(geo.lat, geo.lon, parsed.lat, parsed.lon) > 25) continue;

    const key = parsed.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    places.push(parsed);
    if (places.length >= limit) break;
  }

  return places.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const distA = distanceKm(geo.lat, geo.lon, a.lat, a.lon);
    const distB = distanceKm(geo.lat, geo.lon, b.lat, b.lon);
    return distA - distB;
  });
}

export async function fetchWikidataImageUrl(wikidataId: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`,
      { timeoutMs: 3000 }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const entity = json.entities?.[wikidataId];
    const imageName =
      entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value ??
      entity?.claims?.P154?.[0]?.mainsnak?.datavalue?.value;
    if (!imageName || typeof imageName !== "string") return null;
    const file = encodeURIComponent(imageName.replace(/ /g, "_"));
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=800`;
  } catch {
    return null;
  }
}

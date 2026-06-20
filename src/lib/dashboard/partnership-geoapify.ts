import { fetchWithTimeout } from "@/lib/dashboard/partnership-fetch-utils";
import {
  GEOAPIFY_SEARCH_GROUPS,
  geoapifyCreditsForResultCount,
} from "@/lib/dashboard/partnership-geoapify-categories";
import {
  getGeoapifyApiKey,
  getPartnershipSearchRadiusMeters,
} from "@/lib/dashboard/partnership-config";
import { getCachedCityCoordinates } from "@/lib/dashboard/partnership-city-coords";
import type { GeocodeResult } from "@/lib/dashboard/partnership-osm";

export type GeoapifyPlace = {
  placeId: string;
  name: string;
  categories: string[];
  address: string;
  city?: string;
  state?: string;
  country?: string;
  lat: number;
  lng: number;
  website: string | null;
  phone: string | null;
};

type GeoapifyFeature = {
  properties?: Record<string, unknown>;
  geometry?: { coordinates?: [number, number] };
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractWebsite(props: Record<string, unknown>): string | null {
  const direct = asString(props.website);
  if (direct) return direct;

  const datasource = props.datasource;
  if (datasource && typeof datasource === "object") {
    const dsWebsite = asString((datasource as Record<string, unknown>).website);
    if (dsWebsite) return dsWebsite;
  }

  return null;
}

function extractPhone(props: Record<string, unknown>): string | null {
  const direct = asString(props.phone);
  if (direct) return direct;

  const contact = props.contact;
  if (contact && typeof contact === "object") {
    const contactPhone = asString((contact as Record<string, unknown>).phone);
    if (contactPhone) return contactPhone;
  }

  const datasource = props.datasource;
  if (datasource && typeof datasource === "object") {
    const dsPhone = asString((datasource as Record<string, unknown>).phone);
    if (dsPhone) return dsPhone;
  }

  return null;
}

function parseFeature(feature: GeoapifyFeature): GeoapifyPlace | null {
  const props = feature.properties ?? {};
  const name = asString(props.name);
  if (!name || name.length < 2) return null;

  const coords = feature.geometry?.coordinates;
  const lat = typeof props.lat === "number" ? props.lat : coords?.[1];
  const lng = typeof props.lon === "number" ? props.lon : coords?.[0];
  if (typeof lat !== "number" || typeof lng !== "number") return null;

  const placeId = asString(props.place_id);
  if (!placeId) return null;

  const categories = Array.isArray(props.categories)
    ? props.categories.filter((item): item is string => typeof item === "string")
    : [];

  if (categories.some((cat) => cat.includes("fast_food"))) return null;

  const address =
    asString(props.formatted) ??
    [asString(props.address_line1), asString(props.address_line2)].filter(Boolean).join(", ") ??
    "Address on property website";

  return {
    placeId,
    name,
    categories,
    address,
    city: asString(props.city) ?? undefined,
    state: asString(props.state) ?? undefined,
    country: asString(props.country) ?? undefined,
    lat,
    lng,
    website: extractWebsite(props),
    phone: extractPhone(props),
  };
}

export async function geocodeWithGeoapify(input: {
  city: string;
  state: string;
  country: string;
  cityKey?: string;
}): Promise<{ geo: GeocodeResult | null; creditsUsed: number }> {
  if (input.cityKey) {
    const cached = getCachedCityCoordinates(input.cityKey);
    if (cached) {
      return {
        geo: {
          lat: cached.lat,
          lon: cached.lon,
          displayName: cached.label,
          city: cached.geocodeCity,
          state: cached.geocodeState,
          country: cached.geocodeCountry,
        },
        creditsUsed: 0,
      };
    }
  }

  const apiKey = getGeoapifyApiKey();
  if (!apiKey) return { geo: null, creditsUsed: 0 };

  const query = [input.city, input.state, input.country].filter(Boolean).join(", ");
  if (!query.trim()) return { geo: null, creditsUsed: 0 };

  const params = new URLSearchParams({
    text: query,
    limit: "1",
    apiKey,
  });

  const res = await fetchWithTimeout(
    `https://api.geoapify.com/v1/geocode/search?${params.toString()}`,
    { timeoutMs: 6000 }
  );
  if (!res.ok) return { geo: null, creditsUsed: 0 };

  const json = (await res.json()) as { features?: GeoapifyFeature[] };
  const feature = json.features?.[0];
  if (!feature) return { geo: null, creditsUsed: 0 };

  const props = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  const lat = typeof props.lat === "number" ? props.lat : coords?.[1];
  const lng = typeof props.lon === "number" ? props.lon : coords?.[0];
  if (typeof lat !== "number" || typeof lng !== "number") {
    return { geo: null, creditsUsed: 0 };
  }

  return {
    geo: {
      lat,
      lon: lng,
      displayName: asString(props.formatted) ?? asString(props.city) ?? query,
      city: asString(props.city) ?? undefined,
      state: asString(props.state) ?? undefined,
      country: asString(props.country) ?? undefined,
    },
    creditsUsed: 1,
  };
}

export async function searchGeoapifyPlacesGroup(
  lat: number,
  lng: number,
  categories: string[],
  limit: number
): Promise<{ places: GeoapifyPlace[]; creditsUsed: number }> {
  const apiKey = getGeoapifyApiKey();
  if (!apiKey) return { places: [], creditsUsed: 0 };

  const radius = getPartnershipSearchRadiusMeters();
  const params = new URLSearchParams({
    categories: categories.join(","),
    filter: `circle:${lng},${lat},${radius}`,
    bias: `proximity:${lng},${lat}`,
    limit: String(limit),
    lang: "en",
    apiKey,
  });

  const res = await fetchWithTimeout(
    `https://api.geoapify.com/v2/places?${params.toString()}`,
    { timeoutMs: 8000 }
  );
  if (!res.ok) return { places: [], creditsUsed: 0 };

  const json = (await res.json()) as { features?: GeoapifyFeature[] };
  const places: GeoapifyPlace[] = [];

  for (const feature of json.features ?? []) {
    const parsed = parseFeature(feature);
    if (parsed) places.push(parsed);
  }

  return {
    places,
    creditsUsed: geoapifyCreditsForResultCount(places.length),
  };
}

export async function searchGeoapifyPlacesGrouped(
  lat: number,
  lng: number
): Promise<{ places: GeoapifyPlace[]; creditsUsed: number }> {
  const results = await Promise.all(
    GEOAPIFY_SEARCH_GROUPS.map((group) =>
      searchGeoapifyPlacesGroup(lat, lng, [...group.categories], group.limit)
    )
  );

  const seen = new Set<string>();
  const places: GeoapifyPlace[] = [];
  let creditsUsed = 0;

  for (const result of results) {
    creditsUsed += result.creditsUsed;
    for (const place of result.places) {
      const key = place.placeId;
      if (seen.has(key)) continue;
      seen.add(key);
      places.push(place);
    }
  }

  return { places, creditsUsed };
}

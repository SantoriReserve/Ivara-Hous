/**
 * Global hospitality discovery via OpenStreetMap (Nominatim + Overpass).
 * Supplements the curated directory for any city worldwide.
 */

export type OsmPlace = {
  osmId: string;
  name: string;
  category: string;
  address: string;
  website: string | null;
  email: string | null;
  phone: string | null;
  wikidata: string | null;
  tier: 1 | 2 | 3;
};

type GeocodeResult = {
  lat: number;
  lon: number;
  displayName: string;
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
  const parts = [input.city, input.state, input.country].filter((p) => p.trim());
  if (parts.length === 0) return null;

  const q = encodeURIComponent(parts.join(", "));
  await sleep(1100);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&addressdetails=1`,
    { headers: NOMINATIM_HEADERS }
  );
  if (!res.ok) return null;

  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  const hit = data[0];
  if (!hit) return null;

  return {
    lat: Number(hit.lat),
    lon: Number(hit.lon),
    displayName: hit.display_name,
  };
}

function buildAddress(tags: Record<string, string>): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] ?? tags["addr:town"],
    tags["addr:state"],
    tags["addr:country"],
  ].filter(Boolean);
  return parts.join(", ") || tags["addr:place"] || "Address on property website";
}

function inferTier(name: string, category: string, tags: Record<string, string>): 1 | 2 | 3 {
  const lower = name.toLowerCase();
  const stars = Number(tags.stars ?? tags["tourism:hotel:stars"] ?? 0);
  const luxuryWords = ["ritz", "four seasons", "mandarin", "rosewood", "aman", "st. regis", "peninsula", "bulgari", "edition", "waldorf", "park hyatt", "fairmont", "sofitel", "raffles", "luxury", "resort &"];
  const chainWords = ["marriott", "hilton", "hyatt", "ihg", "accor", "wyndham", "radisson"];

  if (luxuryWords.some((w) => lower.includes(w)) || stars >= 5) return 3;
  if (chainWords.some((w) => lower.includes(w)) || stars >= 4) return 2;
  if (category.includes("Restaurant") || category.includes("Café")) return 1;
  if (category.includes("Experience")) return 2;
  return 1;
}

function categoryFromTags(tags: Record<string, string>): string {
  if (tags.tourism === "hotel" || tags.tourism === "guest_house") {
    return tags.stars && Number(tags.stars) >= 4 ? "Luxury Hotel" : "Boutique Hotel";
  }
  if (tags.tourism === "museum" || tags.tourism === "attraction" || tags.tourism === "theme_park") {
    return "Hospitality Experience";
  }
  if (tags.amenity === "restaurant" || tags.amenity === "fast_food") return "Restaurant";
  if (tags.amenity === "cafe") return "Café";
  if (tags.tourism === "hostel") return "Boutique Hotel";
  return "Hospitality Brand";
}

function parseOsmElement(
  el: { id: number; tags?: Record<string, string> },
  type: "node" | "way"
): OsmPlace | null {
  const tags = el.tags ?? {};
  const name = tags.name ?? tags["name:en"];
  if (!name || name.length < 2) return null;
  if (tags.disused === "yes" || tags.abandoned === "yes") return null;

  const category = categoryFromTags(tags);
  return {
    osmId: `${type}/${el.id}`,
    name,
    category,
    address: buildAddress(tags),
    website: tags.website ?? tags["contact:website"] ?? null,
    email: tags.email ?? tags["contact:email"] ?? null,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    wikidata: tags.wikidata ?? null,
    tier: inferTier(name, category, tags),
  };
}

export async function fetchOsmHospitalityPlaces(
  geo: GeocodeResult,
  limit = 40
): Promise<OsmPlace[]> {
  const radius = 12000;
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"~"hotel|guest_house|hostel|museum|attraction"](around:${radius},${geo.lat},${geo.lon});
      node["amenity"~"restaurant|cafe"](around:${radius},${geo.lat},${geo.lon});
    );
    out body ${limit + 20};
  `;

  const endpoints = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
  ];

  let res: Response | null = null;
  for (const endpoint of endpoints) {
    const attempt = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": NOMINATIM_HEADERS["User-Agent"],
        Accept: "application/json",
      },
      body: new URLSearchParams({ data: query }).toString(),
    });
    if (attempt.ok) {
      res = attempt;
      break;
    }
  }

  if (!res) return [];

  if (!res.ok) return [];

  const json = (await res.json()) as {
    elements: Array<{ id: number; type: "node" | "way"; tags?: Record<string, string> }>;
  };

  const places: OsmPlace[] = [];
  const seen = new Set<string>();

  for (const el of json.elements ?? []) {
    const parsed = parseOsmElement(el, "node");
    if (!parsed) continue;
    const key = parsed.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    places.push(parsed);
    if (places.length >= limit) break;
  }

  return places.sort((a, b) => a.tier - b.tier);
}

export async function fetchWikidataImageUrl(wikidataId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`,
      {}
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

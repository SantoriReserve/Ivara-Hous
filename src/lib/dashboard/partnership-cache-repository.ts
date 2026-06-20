import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getPartnershipCacheTtlDays,
  getPartnershipCityCacheTtlDays,
} from "@/lib/dashboard/partnership-config";
import type { GeoapifyPlace } from "@/lib/dashboard/partnership-geoapify";
import type { PartnershipContactIntel } from "@/lib/dashboard/partnership-contact-types";

export type CachedPartnershipPlace = {
  id: string;
  external_id: string;
  source: string;
  name: string;
  category: string;
  geoapify_categories: string[];
  address: string;
  city_key: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  website: string | null;
  phone: string | null;
  instagram: string | null;
  contact_intelligence: PartnershipContactIntel | null;
  image_url: string | null;
  image_source: string | null;
  fetched_at: string;
  expires_at: string;
};

export type CachedCityGeocode = {
  lat: number;
  lng: number;
  display_name: string;
  geoapify_place_id: string | null;
};

export type CachedLocationSearch = {
  place_ids: string[];
  result_count: number;
  fetched_at: string;
  expires_at: string;
};

function cacheExpiryIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

export function buildLocationHash(parts: {
  cityKey: string;
  state: string;
  country: string;
}): string {
  const normalized = [parts.cityKey, parts.state, parts.country]
    .map((part) => part.trim().toLowerCase())
    .join("|");
  return createHash("sha256").update(normalized).digest("hex").slice(0, 32);
}

export async function getCachedLocationSearch(
  locationHash: string
): Promise<CachedLocationSearch | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("partnership_location_cache")
      .select("place_ids, result_count, fetched_at, expires_at")
      .eq("location_hash", locationHash)
      .maybeSingle();

    if (error || !data || isExpired(data.expires_at)) return null;
    return data as CachedLocationSearch;
  } catch {
    return null;
  }
}

export async function getCachedCityGeocode(
  locationHash: string
): Promise<CachedCityGeocode | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("partnership_city_cache")
      .select("lat, lng, display_name, geoapify_place_id, expires_at")
      .eq("location_hash", locationHash)
      .maybeSingle();

    if (error || !data || isExpired(data.expires_at)) return null;
    return {
      lat: data.lat,
      lng: data.lng,
      display_name: data.display_name,
      geoapify_place_id: data.geoapify_place_id,
    };
  } catch {
    return null;
  }
}

export async function setCachedCityGeocode(
  locationHash: string,
  parts: {
    cityKey: string;
    state: string;
    country: string;
    lat: number;
    lng: number;
    displayName: string;
    geoapifyPlaceId?: string | null;
  }
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const expiresAt = cacheExpiryIso(getPartnershipCityCacheTtlDays());
    await supabase.from("partnership_city_cache").upsert(
      {
        location_hash: locationHash,
        city_key: parts.cityKey,
        state: parts.state,
        country: parts.country,
        lat: parts.lat,
        lng: parts.lng,
        display_name: parts.displayName,
        geoapify_place_id: parts.geoapifyPlaceId ?? null,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "location_hash" }
    );
  } catch {
    // Cache write is best-effort — search still succeeds without persistence.
  }
}

export async function getPlacesByIds(ids: string[]): Promise<CachedPartnershipPlace[]> {
  if (ids.length === 0) return [];

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("partnership_places")
      .select(
        "id, external_id, source, name, category, geoapify_categories, address, city_key, state, country, lat, lng, website, phone, instagram, contact_intelligence, image_url, image_source, fetched_at, expires_at"
      )
      .in("id", ids);

    if (error || !data) return [];

    const byId = new Map(data.map((row) => [row.id as string, row as CachedPartnershipPlace]));
    return ids
      .map((id) => byId.get(id))
      .filter((row): row is CachedPartnershipPlace => Boolean(row));
  } catch {
    return [];
  }
}

export async function upsertPartnershipPlaces(
  places: Array<{
    place: GeoapifyPlace;
    category: string;
    cityKey: string;
    state: string;
    country: string;
    imageUrl?: string | null;
    imageSource?: string | null;
    instagram?: string | null;
    contactIntelligence?: PartnershipContactIntel | null;
  }>
): Promise<CachedPartnershipPlace[]> {
  if (places.length === 0) return [];

  try {
    const supabase = getSupabaseAdmin();
    const expiresAt = cacheExpiryIso(getPartnershipCacheTtlDays());
    const now = new Date().toISOString();

    const rows = places.map(
      ({ place, category, cityKey, state, country, imageUrl, imageSource, instagram, contactIntelligence }) => ({
      external_id: place.placeId,
      source: "geoapify",
      name: place.name,
      category,
      geoapify_categories: place.categories,
      address: place.address,
      city_key: cityKey,
      state,
      country,
      lat: place.lat,
      lng: place.lng,
      website: place.website,
      phone: place.phone,
      instagram: instagram ?? place.instagram ?? null,
      contact_intelligence: contactIntelligence ?? null,
      image_url: imageUrl ?? null,
      image_source: imageSource ?? null,
      raw_data: place,
      fetched_at: now,
      expires_at: expiresAt,
      updated_at: now,
    })
    );

    const { data, error } = await supabase
      .from("partnership_places")
      .upsert(rows, { onConflict: "source,external_id" })
      .select(
        "id, external_id, source, name, category, geoapify_categories, address, city_key, state, country, lat, lng, website, phone, instagram, contact_intelligence, image_url, image_source, fetched_at, expires_at"
      );

    if (error || !data) return [];
    return data as CachedPartnershipPlace[];
  } catch {
    return [];
  }
}

export async function setCachedLocationSearch(
  locationHash: string,
  parts: {
    cityKey: string;
    state: string;
    country: string;
    locationLabel: string;
    placeIds: string[];
  }
): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    const expiresAt = cacheExpiryIso(getPartnershipCacheTtlDays());
    await supabase.from("partnership_location_cache").upsert(
      {
        location_hash: locationHash,
        city_key: parts.cityKey,
        state: parts.state,
        country: parts.country,
        location_label: parts.locationLabel,
        place_ids: parts.placeIds,
        result_count: parts.placeIds.length,
        fetched_at: new Date().toISOString(),
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "location_hash" }
    );
  } catch {
    // Best-effort cache write.
  }
}

export async function logPartnershipSearch(entry: {
  userId?: string;
  locationLabel: string;
  cityKey: string;
  resultCount: number;
  cacheHit: boolean;
  source: string;
  creditsUsed: number;
  latencyMs: number;
}): Promise<void> {
  if (!entry.userId) return;

  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("partnership_search_logs").insert({
      user_id: entry.userId,
      location_label: entry.locationLabel,
      city_key: entry.cityKey,
      result_count: entry.resultCount,
      cache_hit: entry.cacheHit,
      source: entry.source,
      credits_used: entry.creditsUsed,
      latency_ms: entry.latencyMs,
    });
  } catch {
    // Analytics are optional.
  }
}

export async function refreshPlaceImages(
  updates: Array<{ id: string; imageUrl: string; imageSource: string }>
): Promise<void> {
  if (updates.length === 0) return;

  try {
    const supabase = getSupabaseAdmin();
    await Promise.all(
      updates.map((update) =>
        supabase
          .from("partnership_places")
          .update({
            image_url: update.imageUrl,
            image_source: update.imageSource,
            updated_at: new Date().toISOString(),
          })
          .eq("id", update.id)
      )
    );
  } catch {
    // Best-effort image cache refresh.
  }
}

export async function refreshPlaceContactIntel(
  updates: Array<{ id: string; contact: PartnershipContactIntel; instagram?: string | null }>
): Promise<void> {
  if (updates.length === 0) return;

  try {
    const supabase = getSupabaseAdmin();
    await Promise.all(
      updates.map((update) =>
        supabase
          .from("partnership_places")
          .update({
            contact_intelligence: update.contact,
            instagram: update.instagram ?? update.contact.instagram?.handle ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", update.id)
      )
    );
  } catch {
    // Best-effort contact cache refresh.
  }
}

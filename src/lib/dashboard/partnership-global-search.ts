import { fillContext } from "@/lib/dashboard/fill-context";
import { directoryBusinessToOpportunity } from "@/lib/dashboard/partnership-directory-mapper";
import { matchDirectoryBusinesses } from "@/lib/dashboard/partnership-directory";
import type { CachedPartnershipPlace } from "@/lib/dashboard/partnership-cache-repository";
import {
  buildLocationHash,
  getCachedCityGeocode,
  getCachedLocationSearch,
  getPlacesByIds,
  logPartnershipSearch,
  refreshPlaceContactIntel,
  refreshPlaceImages,
  setCachedCityGeocode,
  setCachedLocationSearch,
  upsertPartnershipPlaces,
} from "@/lib/dashboard/partnership-cache-repository";
import { enrichContactForWebsites } from "@/lib/dashboard/partnership-contact-enrichment";
import {
  applyContactIntelToOpportunityFields,
  buildDiscoveredContactIntel,
} from "@/lib/dashboard/partnership-contact-intelligence";
import {
  getPartnershipMaxResults,
  isGeoapifyEnabled,
} from "@/lib/dashboard/partnership-config";
import { discoveredPlaceToOpportunity } from "@/lib/dashboard/partnership-discovered-mapper";
import { withTimeout } from "@/lib/dashboard/partnership-fetch-utils";
import {
  geocodeWithGeoapify,
  searchGeoapifyPlacesGrouped,
  type GeoapifyPlace,
} from "@/lib/dashboard/partnership-geoapify";
import { mapGeoapifyToCategory } from "@/lib/dashboard/partnership-geoapify-categories";
import { enrichImagesForWebsites } from "@/lib/dashboard/partnership-image-enrichment";
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
  geocodeLocation,
  type GeocodeResult,
} from "@/lib/dashboard/partnership-osm";
import { discoveredPlaceMatchesResolvedLocation } from "@/lib/dashboard/partnership-place-matching";
import { getVerifiedPropertyImageUrl } from "@/lib/dashboard/partnership-property-images";
import {
  isVerifiedPartnershipOpportunity,
  normalizeInstagramHandle,
} from "@/lib/dashboard/partnership-result-utils";
import { rankPartnershipOpportunities } from "@/lib/dashboard/partnership-stage-ranking";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";
import type { LocationSearchInput } from "@/lib/dashboard/partnership-search";

type SearchOptions = {
  userId?: string;
};

async function enrichAndCacheContacts(storedPlaces: CachedPartnershipPlace[]): Promise<void> {
  const pending = storedPlaces.filter(
    (place) =>
      place.website &&
      (!place.contact_intelligence ||
        (!place.contact_intelligence.emails.length &&
          place.contact_intelligence.website?.confidence !== "verified"))
  );
  if (pending.length === 0) return;

  const contactUpdates = await enrichContactForWebsites(
    pending.map((place) => ({
      id: place.id,
      website: place.website,
      phone: place.phone,
    })),
    4
  );

  if (contactUpdates.length > 0) {
    await refreshPlaceContactIntel(
      contactUpdates.map((update) => ({
        id: update.id,
        contact: update.contact,
        instagram: update.contact.instagram?.handle ?? null,
      }))
    );
  }
}

async function enrichAndCacheImages(storedPlaces: CachedPartnershipPlace[]): Promise<void> {
  const pending = storedPlaces.filter((place) => place.website && !place.image_url);
  if (pending.length === 0) return;

  const imageUpdates = await enrichImagesForWebsites(
    pending.map((place) => ({
      id: place.id,
      website: place.website,
      existingImageUrl: place.image_url,
    })),
    6
  );

  if (imageUpdates.length > 0) {
    await refreshPlaceImages(imageUpdates);
  }
}

function loadCuratedResults(
  ctx: CreatorContext,
  input: LocationSearchInput,
  locationLabel: string
): PartnershipOpportunity[] {
  const results: PartnershipOpportunity[] = [];

  for (const business of matchDirectoryBusinesses(input)) {
    const imageUrl = getVerifiedPropertyImageUrl(business.id) ?? business.imageUrl;
    const opp = enrichOpportunity(
      {
        ...directoryBusinessToOpportunity(business, ctx, locationLabel),
        imageUrl,
      },
      ctx
    );
    if (isVerifiedPartnershipOpportunity(opp)) {
      results.push(opp);
    }
  }

  return results;
}

async function resolveGeocode(
  geocodeInput: { city: string; state: string; country: string },
  cityKey: string,
  locationHash: string
): Promise<{ geo: GeocodeResult | null; creditsUsed: number }> {
  if (isGeoapifyEnabled()) {
    const cachedCity = await getCachedCityGeocode(locationHash);
    if (cachedCity) {
      return {
        geo: {
          lat: cachedCity.lat,
          lon: cachedCity.lng,
          displayName: cachedCity.display_name,
        },
        creditsUsed: 0,
      };
    }

    const geocoded = await withTimeout(
      geocodeWithGeoapify({ ...geocodeInput, cityKey }),
      6000,
      { geo: null, creditsUsed: 0 }
    );

    if (geocoded.geo) {
      void setCachedCityGeocode(locationHash, {
        cityKey,
        state: geocodeInput.state,
        country: geocodeInput.country,
        lat: geocoded.geo.lat,
        lng: geocoded.geo.lon,
        displayName: geocoded.geo.displayName,
      });
      return geocoded;
    }
  }

  const osmGeo = await withTimeout(geocodeLocation(geocodeInput, cityKey), 6000, null);
  return { geo: osmGeo, creditsUsed: 0 };
}

function filterFreshPlaces(
  freshPlaces: GeoapifyPlace[],
  geo: GeocodeResult,
  resolved: ReturnType<typeof resolveLocationSearch>,
  cityKey: string,
  state: string,
  country: string
): Array<{
  place: GeoapifyPlace;
  category: string;
  cityKey: string;
  state: string;
  country: string;
  imageUrl?: string | null;
  imageSource?: string | null;
}> {
  const seen = new Set<string>();
  const merged: Array<{
    place: GeoapifyPlace;
    category: string;
    cityKey: string;
    state: string;
    country: string;
    imageUrl?: string | null;
    imageSource?: string | null;
  }> = [];

  for (const place of freshPlaces) {
    const key = place.name.toLowerCase();
    if (seen.has(key)) continue;
    if (!discoveredPlaceMatchesResolvedLocation(place, geo, resolved)) continue;
    seen.add(key);
    merged.push({
      place,
      category: mapGeoapifyToCategory(place.categories),
      cityKey,
      state,
      country,
    });
  }

  return merged;
}

async function appendOsmDiscoveries(
  ctx: CreatorContext,
  results: PartnershipOpportunity[],
  seenNames: Set<string>,
  geo: GeocodeResult,
  resolved: ReturnType<typeof resolveLocationSearch>,
  locationLabel: string,
  targetResults: number
): Promise<void> {
  const osmPlaces = await withTimeout(
    fetchOsmHospitalityPlaces(geo, Math.max(targetResults - results.length + 10, 20)),
    10000,
    []
  );

  for (const place of osmPlaces) {
    if (!osmPlaceMatchesResolvedLocation(place, geo, resolved)) continue;
    const key = place.name.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);

    const website = place.website ?? "";
    const instagram = place.instagram
      ? normalizeInstagramHandle({
          instagram: place.instagram,
          "contact:instagram": place.instagram,
        })
      : null;
    const contactIntel = buildDiscoveredContactIntel({
      website: website || null,
      phone: place.phone,
      instagram,
      instagramSource: instagram ? "osm" : undefined,
    });
    const contactFields = applyContactIntelToOpportunityFields(contactIntel);

    const opp = enrichOpportunity(
      {
        id: `osm-${place.osmId.replace("/", "-")}`,
        businessName: place.name,
        category: place.category,
        description: `${place.name} is a verified ${place.category.toLowerCase()} in ${locationLabel}.`,
        website: contactFields.website,
        instagram: contactFields.instagram,
        address: place.address,
        contactEmail: contactFields.contactEmail,
        contactPerson: contactFields.contactPerson,
        contactWhere: fillContext(ctx, contactIntel.outreachGuidance),
        contactIntel,
        outreachType: "Partnership Pitch",
        pitchTemplateId: "boutique-hotel",
        pitchTemplateTitle: "Boutique Hotel Pitch",
        matchReason: `Verified ${place.category.toLowerCase()} in ${locationLabel}.`,
        whyYou: `${place.name} is matched for your creator stage.`,
        doToday: contactFields.contactEmail
          ? fillContext(
              ctx,
              `Send your pitch to ${contactFields.contactEmail} with one specific detail from ${place.name}.`
            )
          : fillContext(
              ctx,
              `Research verified contact details for ${place.name} before sending your pitch.`
            ),
        priority: "medium",
        imageUrl: getVerifiedPropertyImageUrl(`osm-${place.osmId}`) ?? "",
        opportunityScore: 4,
        difficultyScore: 3,
        valueScore: 4,
        tierLabel: "Tier 2 — Established Partners",
        partnershipTier: place.tier,
        source: "discovered",
        recommendedPitch: fillContext(ctx, "Personalize your outreach for {pillar} content."),
        searchLocation: locationLabel,
      },
      ctx
    );

    if (!isVerifiedPartnershipOpportunity(opp)) continue;
    results.push(opp);
    if (results.length >= targetResults) break;
  }
}

export async function searchPartnershipOpportunitiesGlobal(
  ctx: CreatorContext,
  input: LocationSearchInput,
  options: SearchOptions = {}
): Promise<PartnershipOpportunity[]> {
  const startedAt = Date.now();
  const targetResults = getPartnershipMaxResults();

  const resolved = resolveLocationSearch(input);
  if (!resolved.label && !resolved.city && !resolved.state && !resolved.country) return [];

  const locationLabel = resolved.label || resolved.cityLabel;
  const geocodeInput = geocodeInputFromSearch(input, resolved);
  const locationHash = buildLocationHash({
    cityKey: resolved.city,
    state: resolved.state,
    country: resolved.country,
  });

  const seenNames = new Set<string>();
  const results: PartnershipOpportunity[] = [];

  for (const opp of loadCuratedResults(ctx, input, locationLabel)) {
    const key = opp.businessName.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    results.push(opp);
  }

  let creditsUsed = 0;
  let cacheHit = false;
  let source: "cache" | "geoapify" | "curated" | "mixed" = results.length > 0 ? "curated" : "mixed";

  const shouldDiscover =
    Boolean(resolved.city || resolved.state || resolved.country || geocodeInput.city || geocodeInput.country) &&
    results.length < targetResults;

  if (shouldDiscover && isGeoapifyEnabled()) {
    const cachedLocation = await getCachedLocationSearch(locationHash);

    if (cachedLocation && cachedLocation.place_ids.length > 0) {
      cacheHit = true;
      source = results.length > 0 ? "mixed" : "cache";

      const cachedPlaces = await getPlacesByIds(cachedLocation.place_ids);
      for (const cached of cachedPlaces) {
        const key = cached.name.toLowerCase();
        if (seenNames.has(key)) continue;
        seenNames.add(key);

        const opp = enrichOpportunity(
          discoveredPlaceToOpportunity(cached, ctx, locationLabel),
          ctx
        );
        if (!isVerifiedPartnershipOpportunity(opp)) continue;
        results.push(opp);
        if (results.length >= targetResults) break;
      }
    } else {
      const { geo, creditsUsed: geocodeCredits } = await resolveGeocode(
        geocodeInput,
        resolved.city,
        locationHash
      );
      creditsUsed += geocodeCredits;

      if (geo) {
        const { places: freshPlaces, creditsUsed: placesCredits } = await withTimeout(
          searchGeoapifyPlacesGrouped(geo.lat, geo.lon),
          10000,
          { places: [], creditsUsed: 0 }
        );
        creditsUsed += placesCredits;
        source = results.length > 0 ? "mixed" : "geoapify";

        const merged = filterFreshPlaces(
          freshPlaces,
          geo,
          resolved,
          resolved.city,
          resolved.state,
          resolved.country
        );

        const upsertPayload = merged.map((entry) => {
          const contactIntelligence = buildDiscoveredContactIntel({
            website: entry.place.website,
            phone: entry.place.phone,
            instagram: entry.place.instagram,
            instagramSource: entry.place.instagram ? "geoapify" : undefined,
          });

          return {
            ...entry,
            imageUrl: entry.imageUrl ?? null,
            imageSource: entry.imageSource ?? null,
            instagram: entry.place.instagram,
            contactIntelligence,
          };
        });

        const storedPlaces = await upsertPartnershipPlaces(upsertPayload);
        const storedByExternalId = new Map(storedPlaces.map((row) => [row.external_id, row]));
        const orderedPlaceIds: string[] = [];

        for (const entry of merged) {
          const key = entry.place.name.toLowerCase();
          if (seenNames.has(key)) continue;

          const stored = storedByExternalId.get(entry.place.placeId);
          const opp = enrichOpportunity(
            discoveredPlaceToOpportunity(stored ?? entry.place, ctx, locationLabel),
            ctx
          );
          if (!isVerifiedPartnershipOpportunity(opp)) continue;

          seenNames.add(key);
          results.push(opp);
          if (stored) orderedPlaceIds.push(stored.id);
          if (results.length >= targetResults) break;
        }

        if (orderedPlaceIds.length > 0) {
          void setCachedLocationSearch(locationHash, {
            cityKey: resolved.city,
            state: resolved.state,
            country: resolved.country,
            locationLabel,
            placeIds: orderedPlaceIds,
          });
        }

        void enrichAndCacheImages(storedPlaces);
        void enrichAndCacheContacts(storedPlaces);
      }
    }
  } else if (shouldDiscover) {
    const { geo } = await resolveGeocode(geocodeInput, resolved.city, locationHash);
    if (geo) {
      await appendOsmDiscoveries(ctx, results, seenNames, geo, resolved, locationLabel, targetResults);
    }
  }

  const ranked = rankPartnershipOpportunities(results, ctx).slice(0, targetResults);

  void logPartnershipSearch({
    userId: options.userId,
    locationLabel,
    cityKey: resolved.city,
    resultCount: ranked.length,
    cacheHit,
    source,
    creditsUsed,
    latencyMs: Date.now() - startedAt,
  });

  return ranked;
}

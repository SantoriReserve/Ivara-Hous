import { distanceKm, type GeocodeResult } from "@/lib/dashboard/partnership-osm";
import type { ResolvedLocationSearch } from "@/lib/dashboard/partnership-location";
import { addressMatchesResolvedLocation } from "@/lib/dashboard/partnership-location";

export function discoveredPlaceMatchesResolvedLocation(
  place: { address: string; lat: number; lng: number },
  geo: GeocodeResult,
  resolved: ResolvedLocationSearch
): boolean {
  const dist = distanceKm(geo.lat, geo.lon, place.lat, place.lng);
  const maxDist = resolved.city ? 22 : resolved.state ? 35 : 50;
  if (dist > maxDist) return false;

  if (resolved.city && dist <= 18) return true;
  if (addressMatchesResolvedLocation(place.address, resolved)) return true;

  if (resolved.city === "miami" && dist <= 20) {
    const haystack = place.address.toLowerCase();
    if (haystack.includes("miami") || haystack.includes("florida") || haystack.includes(" fl")) {
      return true;
    }
  }

  if (resolved.city === "new-york-city" && dist <= 20) {
    const haystack = place.address.toLowerCase();
    if (haystack.includes("new york") || haystack.includes(" ny")) return true;
  }

  if (resolved.city && dist <= 12) {
    const cityWords = resolved.city.split("-").filter((part) => part.length > 3);
    const haystack = place.address.toLowerCase();
    if (cityWords.some((part) => haystack.includes(part))) return true;
  }

  return !resolved.city && dist <= 25;
}

export function getPartnershipCacheTtlDays(): number {
  const raw = process.env.PARTNERSHIP_CACHE_TTL_DAYS;
  const parsed = raw ? Number.parseInt(raw, 10) : 30;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

export function getPartnershipCityCacheTtlDays(): number {
  const raw = process.env.PARTNERSHIP_CITY_CACHE_TTL_DAYS;
  const parsed = raw ? Number.parseInt(raw, 10) : 90;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 90;
}

export function getPartnershipSearchRadiusMeters(): number {
  const raw = process.env.PARTNERSHIP_SEARCH_RADIUS_METERS;
  const parsed = raw ? Number.parseInt(raw, 10) : 15000;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15000;
}

export function getPartnershipMaxResults(): number {
  const raw = process.env.PARTNERSHIP_MAX_RESULTS_PER_SEARCH;
  const parsed = raw ? Number.parseInt(raw, 10) : 30;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

export function isGeoapifyEnabled(): boolean {
  const flag = process.env.PARTNERSHIP_GEOAPIFY_ENABLED;
  if (flag === "false" || flag === "0") return false;
  return Boolean(process.env.GEOAPIFY_API_KEY?.trim());
}

export function getGeoapifyApiKey(): string | null {
  const key = process.env.GEOAPIFY_API_KEY?.trim();
  return key || null;
}

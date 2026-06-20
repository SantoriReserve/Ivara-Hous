/**
 * Cached coordinates for major hospitality markets.
 * Avoids Nominatim rate limits and keeps search fast on serverless.
 */

export type CityCoordEntry = {
  lat: number;
  lon: number;
  label: string;
  geocodeCity: string;
  geocodeState?: string;
  geocodeCountry: string;
};

export const CITY_COORDINATES: Record<string, CityCoordEntry> = {
  miami: {
    lat: 25.7617,
    lon: -80.1918,
    label: "Miami, FL",
    geocodeCity: "Miami",
    geocodeState: "Florida",
    geocodeCountry: "United States",
  },
  "new-york-city": {
    lat: 40.7128,
    lon: -74.006,
    label: "New York City, NY",
    geocodeCity: "New York City",
    geocodeState: "New York",
    geocodeCountry: "United States",
  },
  "los-angeles": {
    lat: 34.0522,
    lon: -118.2437,
    label: "Los Angeles, CA",
    geocodeCity: "Los Angeles",
    geocodeState: "California",
    geocodeCountry: "United States",
  },
  "san-francisco": {
    lat: 37.7749,
    lon: -122.4194,
    label: "San Francisco, CA",
    geocodeCity: "San Francisco",
    geocodeState: "California",
    geocodeCountry: "United States",
  },
  chicago: {
    lat: 41.8781,
    lon: -87.6298,
    label: "Chicago, IL",
    geocodeCity: "Chicago",
    geocodeState: "Illinois",
    geocodeCountry: "United States",
  },
  london: {
    lat: 51.5074,
    lon: -0.1278,
    label: "London, UK",
    geocodeCity: "London",
    geocodeCountry: "United Kingdom",
  },
  paris: {
    lat: 48.8566,
    lon: 2.3522,
    label: "Paris, France",
    geocodeCity: "Paris",
    geocodeCountry: "France",
  },
  barcelona: {
    lat: 41.3874,
    lon: 2.1686,
    label: "Barcelona, Spain",
    geocodeCity: "Barcelona",
    geocodeCountry: "Spain",
  },
  madrid: {
    lat: 40.4168,
    lon: -3.7038,
    label: "Madrid, Spain",
    geocodeCity: "Madrid",
    geocodeCountry: "Spain",
  },
  rome: {
    lat: 41.9028,
    lon: 12.4964,
    label: "Rome, Italy",
    geocodeCity: "Rome",
    geocodeCountry: "Italy",
  },
  lisbon: {
    lat: 38.7223,
    lon: -9.1393,
    label: "Lisbon, Portugal",
    geocodeCity: "Lisbon",
    geocodeCountry: "Portugal",
  },
  dubai: {
    lat: 25.2048,
    lon: 55.2708,
    label: "Dubai, UAE",
    geocodeCity: "Dubai",
    geocodeCountry: "United Arab Emirates",
  },
  "cape-town": {
    lat: -33.9249,
    lon: 18.4241,
    label: "Cape Town, South Africa",
    geocodeCity: "Cape Town",
    geocodeCountry: "South Africa",
  },
  tulum: {
    lat: 20.2114,
    lon: -87.4654,
    label: "Tulum, Mexico",
    geocodeCity: "Tulum",
    geocodeState: "Quintana Roo",
    geocodeCountry: "Mexico",
  },
  "mexico-city": {
    lat: 19.4326,
    lon: -99.1332,
    label: "Mexico City, Mexico",
    geocodeCity: "Mexico City",
    geocodeCountry: "Mexico",
  },
  bali: {
    lat: -8.4095,
    lon: 115.1889,
    label: "Bali, Indonesia",
    geocodeCity: "Denpasar",
    geocodeCountry: "Indonesia",
  },
  bangkok: {
    lat: 13.7563,
    lon: 100.5018,
    label: "Bangkok, Thailand",
    geocodeCity: "Bangkok",
    geocodeCountry: "Thailand",
  },
  sydney: {
    lat: -33.8688,
    lon: 151.2093,
    label: "Sydney, Australia",
    geocodeCity: "Sydney",
    geocodeCountry: "Australia",
  },
  toronto: {
    lat: 43.6532,
    lon: -79.3832,
    label: "Toronto, Canada",
    geocodeCity: "Toronto",
    geocodeState: "Ontario",
    geocodeCountry: "Canada",
  },
  tokyo: {
    lat: 35.6762,
    lon: 139.6503,
    label: "Tokyo, Japan",
    geocodeCity: "Tokyo",
    geocodeCountry: "Japan",
  },
  amsterdam: {
    lat: 52.3676,
    lon: 4.9041,
    label: "Amsterdam, Netherlands",
    geocodeCity: "Amsterdam",
    geocodeCountry: "Netherlands",
  },
  singapore: {
    lat: 1.3521,
    lon: 103.8198,
    label: "Singapore",
    geocodeCity: "Singapore",
    geocodeCountry: "Singapore",
  },
  prague: {
    lat: 50.0755,
    lon: 14.4378,
    label: "Prague, Czech Republic",
    geocodeCity: "Prague",
    geocodeCountry: "Czech Republic",
  },
};

export function getCachedCityCoordinates(cityKey: string): CityCoordEntry | null {
  return CITY_COORDINATES[cityKey] ?? null;
}

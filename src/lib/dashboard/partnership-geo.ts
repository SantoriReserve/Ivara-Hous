export type GeoKeys = {
  city: string;
  state: string;
  country: string;
};

const CITY_ALIASES: Record<string, string> = {
  nyc: "new-york-city",
  "new york": "new-york-city",
  "new york city": "new-york-city",
  manhattan: "new-york-city",
  brooklyn: "new-york-city",
  "los angeles": "los-angeles",
  la: "los-angeles",
  "san francisco": "san-francisco",
  sf: "san-francisco",
  "miami beach": "miami",
  "south beach": "miami",
  "mexico city": "mexico-city",
  "cdmx": "mexico-city",
  "são paulo": "sao-paulo",
  "sao paulo": "sao-paulo",
  "punta cana": "punta-cana",
  "santo domingo": "santo-domingo",
  "dominican republic": "dominican-republic",
  dr: "dominican-republic",
  uk: "united-kingdom",
  england: "united-kingdom",
  scotland: "united-kingdom",
  uae: "united-arab-emirates",
  "united states": "united-states",
  usa: "united-states",
  us: "united-states",
  america: "united-states",
};

const STATE_ALIASES: Record<string, string> = {
  fl: "florida",
  fla: "florida",
  ny: "new-york",
  ca: "california",
  tx: "texas",
  "quintana roo": "quintana-roo",
};

const COUNTRY_ALIASES: Record<string, string> = {
  usa: "united-states",
  us: "united-states",
  "united states": "united-states",
  america: "united-states",
  uk: "united-kingdom",
  "great britain": "united-kingdom",
  england: "united-kingdom",
  uae: "united-arab-emirates",
  dr: "dominican-republic",
  "dominican republic": "dominican-republic",
};

export function slugifyGeo(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveGeoKeys(input: {
  country: string;
  state: string;
  city: string;
}): GeoKeys {
  const rawCity = slugifyGeo(input.city);
  const rawState = slugifyGeo(input.state);
  const rawCountry = slugifyGeo(input.country);

  return {
    city: CITY_ALIASES[rawCity] ?? CITY_ALIASES_EXTRA[rawCity] ?? rawCity,
    state: STATE_ALIASES[rawState] ?? rawState,
    country: COUNTRY_ALIASES[rawCountry] ?? rawCountry,
  };
}

export function businessMatchesSearch(
  business: { city: string; state: string; country: string },
  search: GeoKeys
): boolean {
  const hasCity = Boolean(search.city);
  const hasState = Boolean(search.state);
  const hasCountry = Boolean(search.country);

  if (hasCity) {
    return business.city === search.city;
  }

  if (hasState) {
    return business.state === search.state && business.country === (search.country || business.country);
  }

  if (hasCountry) {
    return business.country === search.country;
  }

  return false;
}

export const SUPPORTED_CITY_LABELS: Record<string, string> = {
  miami: "Miami, FL",
  "new-york-city": "New York City, NY",
  "los-angeles": "Los Angeles, CA",
  "san-francisco": "San Francisco, CA",
  chicago: "Chicago, IL",
  austin: "Austin, TX",
  nashville: "Nashville, TN",
  charleston: "Charleston, SC",
  scottsdale: "Scottsdale, AZ",
  "las-vegas": "Las Vegas, NV",
  boston: "Boston, MA",
  "washington-dc": "Washington, DC",
  paris: "Paris, France",
  london: "London, UK",
  rome: "Rome, Italy",
  barcelona: "Barcelona, Spain",
  amsterdam: "Amsterdam, Netherlands",
  lisbon: "Lisbon, Portugal",
  berlin: "Berlin, Germany",
  milan: "Milan, Italy",
  copenhagen: "Copenhagen, Denmark",
  tulum: "Tulum, Mexico",
  "mexico-city": "Mexico City, Mexico",
  "buenos-aires": "Buenos Aires, Argentina",
  "sao-paulo": "São Paulo, Brazil",
  cartagena: "Cartagena, Colombia",
  "punta-cana": "Punta Cana, DR",
  "santo-domingo": "Santo Domingo, DR",
  nassau: "Nassau, Bahamas",
  "san-juan": "San Juan, Puerto Rico",
  tokyo: "Tokyo, Japan",
  singapore: "Singapore",
  bali: "Bali, Indonesia",
  dubai: "Dubai, UAE",
  "abu-dhabi": "Abu Dhabi, UAE",
  bangkok: "Bangkok, Thailand",
  doha: "Doha, Qatar",
  sydney: "Sydney, Australia",
  marrakech: "Marrakech, Morocco",
  "cape-town": "Cape Town, South Africa",
  prague: "Prague, Czech Republic",
};

const CITY_ALIASES_EXTRA: Record<string, string> = {
  "cape town": "cape-town",
  "capetown": "cape-town",
  praha: "prague",
};

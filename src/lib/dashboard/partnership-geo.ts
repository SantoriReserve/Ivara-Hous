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
  barcelona: "barcelona",
  madrid: "madrid",
  toronto: "toronto",
  "mexico city": "mexico-city",
  cdmx: "mexico-city",
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
  spain: "spain",
  france: "france",
  italy: "italy",
  mexico: "mexico",
  "czech republic": "czech-republic",
  "south africa": "south-africa",
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

const CITY_ALIASES_EXTRA: Record<string, string> = {
  "cape town": "cape-town",
  capetown: "cape-town",
  praha: "prague",
};

const HYPHEN_CITY_ALIASES: Record<string, string> = {
  "new-york": "new-york-city",
  "south-beach": "miami",
  "miami-beach": "miami",
  la: "los-angeles",
  sf: "san-francisco",
  nyc: "new-york-city",
  cdmx: "mexico-city",
  capetown: "cape-town",
  praha: "prague",
  uae: "dubai",
};

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
  madrid: "Madrid, Spain",
  toronto: "Toronto, Canada",
};

const CITY_COORDINATES_KEY: Record<string, boolean> = Object.fromEntries(
  Object.keys(SUPPORTED_CITY_LABELS).map((key) => [key, true])
);

function resolveCityKey(rawCity: string): string {
  if (!rawCity) return "";
  if (CITY_ALIASES[rawCity]) return CITY_ALIASES[rawCity];
  if (CITY_ALIASES_EXTRA[rawCity]) return CITY_ALIASES_EXTRA[rawCity];
  if (HYPHEN_CITY_ALIASES[rawCity]) return HYPHEN_CITY_ALIASES[rawCity];

  const spaced = rawCity.replace(/-/g, " ");
  if (CITY_ALIASES[spaced]) return CITY_ALIASES[spaced];
  if (CITY_ALIASES_EXTRA[spaced]) return CITY_ALIASES_EXTRA[spaced];

  if (SUPPORTED_CITY_LABELS[rawCity]) return rawCity;
  return rawCity;
}

function resolveCountryKey(rawCountry: string): string {
  if (!rawCountry) return "";
  if (COUNTRY_ALIASES[rawCountry]) return COUNTRY_ALIASES[rawCountry];
  const spaced = rawCountry.replace(/-/g, " ");
  if (COUNTRY_ALIASES[spaced]) return COUNTRY_ALIASES[spaced];
  return rawCountry;
}

export function resolveGeoKeys(input: {
  country: string;
  state: string;
  city: string;
}): GeoKeys {
  const rawCity = slugifyGeo(input.city);
  const rawState = slugifyGeo(input.state);
  const rawCountry = slugifyGeo(input.country);

  let city = resolveCityKey(rawCity);
  let state = STATE_ALIASES[rawState] ?? rawState;
  const country = resolveCountryKey(rawCountry);

  // Common UX: city name entered in state field (e.g. state = "New York", city empty)
  if (!city && rawState) {
    const stateAsCity = resolveCityKey(rawState);
    if (SUPPORTED_CITY_LABELS[stateAsCity] || CITY_COORDINATES_KEY[stateAsCity]) {
      city = stateAsCity;
      state = "";
    }
  }

  return { city, state, country };
}

export function businessMatchesSearch(
  business: { city: string; state: string; country: string },
  search: GeoKeys
): boolean {
  const hasCity = Boolean(search.city);
  const hasState = Boolean(search.state);
  const hasCountry = Boolean(search.country);

  if (hasCity) {
    if (business.city !== search.city) return false;
    if (hasState && business.state !== search.state && business.state !== slugifyGeo(search.state)) {
      return false;
    }
    if (hasCountry && business.country !== search.country) return false;
    return true;
  }

  if (hasState) {
    if (business.state !== search.state) return false;
    if (hasCountry && business.country !== search.country) return false;
    return true;
  }

  if (hasCountry) {
    return business.country === search.country;
  }

  return false;
}


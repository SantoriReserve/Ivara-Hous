/**
 * Generates src/lib/dashboard/partnership-directory-raw.ts from city-grouped seeds.
 * Run: npx tsx scripts/generate-partnership-directory.mts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

type Biz = {
  id: string;
  name: string;
  cat: string;
  web: string;
  ig: string;
  addr: string;
  email: string | null;
  contact: string | null;
  tier: "local" | "boutique" | "stretch";
  pitch: string;
  opp: number;
  diff: number;
  val: number;
};

type City = {
  city: string;
  state: string;
  country: string;
  biz: Biz[];
};

const cities: City[] = [
  {
    city: "miami",
    state: "florida",
    country: "united-states",
    biz: [
      { id: "miami-betsy", name: "The Betsy South Beach", cat: "Boutique Hotel", web: "https://www.thebetsyhotel.com", ig: "@thebetsyhotel", addr: "1440 Ocean Drive, Miami Beach, FL 33139", email: "reservations@thebetsyhotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-vagabond", name: "The Vagabond Hotel", cat: "Boutique Hotel", web: "https://www.vagabondhotel.com", ig: "@vagabondhotel", addr: "7301 Biscayne Blvd, Miami, FL 33138", email: "info@vagabondhotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-life-house", name: "Life House Little Havana", cat: "Small Luxury Hotel", web: "https://www.lifehousehotels.com/little-havana", ig: "@lifehousehotels", addr: "2118 Calle Ocho, Miami, FL 33135", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
      { id: "miami-local-house", name: "The Local House Miami Beach", cat: "Restaurant & Hotel", web: "https://www.thelocalhouse.com", ig: "@thelocalhousemiami", addr: "400 Ocean Dr, Miami Beach, FL 33139", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
      { id: "miami-esme", name: "Esmé Miami Beach", cat: "Boutique Hotel", web: "https://www.esmehotel.com", ig: "@esmehotel", addr: "1438 Washington Ave, Miami Beach, FL 33139", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
      { id: "miami-casa-faena", name: "Casa Faena Miami Beach", cat: "Luxury Hotel", web: "https://www.faena.com/casa-faena", ig: "@casafaenamiami", addr: "3500 Collins Ave, Miami Beach, FL 33140", email: null, contact: "Marketing — faena.com press & partnerships", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
      { id: "miami-standard", name: "The Standard Spa, Miami Beach", cat: "Wellness Hotel", web: "https://www.standardhotels.com/miami-beach", ig: "@standardhotels", addr: "40 Island Ave, Miami Beach, FL 33139", email: "reservations@standardhotels.com", contact: "Partnerships — standardhotels.com contact", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
      { id: "miami-carbone", name: "Carbone Miami", cat: "Restaurant", web: "https://carbonemiami.com", ig: "@carbonemiami", addr: "49 Collins Ave, Miami Beach, FL 33139", email: null, contact: "PR — Major Food Group media inquiries", tier: "stretch", pitch: "restaurant", opp: 3, diff: 4, val: 5 },
      { id: "miami-komodo", name: "Komodo", cat: "Restaurant", web: "https://komodomiami.com", ig: "@komodomiami", addr: "801 Brickell Ave, Miami, FL 33131", email: "info@komodomiami.com", contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
      { id: "miami-faena", name: "Faena Hotel Miami Beach", cat: "Luxury Hotel", web: "https://www.faena.com/miami-beach", ig: "@faenahotelmiamibeach", addr: "3201 Collins Ave, Miami Beach, FL 33140", email: null, contact: "Marketing — faena.com press & partnerships", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "miami-1-hotel", name: "1 Hotel South Beach", cat: "Luxury Hotel", web: "https://www.1hotels.com/south-beach", ig: "@1hotels", addr: "2341 Collins Ave, Miami Beach, FL 33139", email: null, contact: "Influencer Relations — 1hotels.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
      { id: "miami-plymouth", name: "The Plymouth South Beach", cat: "Boutique Hotel", web: "https://www.theplymouth.com", ig: "@theplymouthsb", addr: "336 21st St, Miami Beach, FL 33139", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-wynwood", name: "Arlo Wynwood", cat: "Boutique Hotel", web: "https://www.arlohotels.com/wynwood", ig: "@arlohotels", addr: "2217 NW Miami Ct, Miami, FL 33127", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-mandolin", name: "Mandolin Aegean Bistro", cat: "Restaurant", web: "https://www.mandolinrestaurant.com", ig: "@mandolinmiami", addr: "4310 NE 2nd Ave, Miami, FL 33137", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "miami-all-day", name: "All Day", cat: "Café", web: "https://www.alldaymiami.com", ig: "@alldaymiami", addr: "1035 N Miami Ave, Miami, FL 33136", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "miami-cafe-bastille", name: "Café Bastille Miami", cat: "Café", web: "https://www.cafebastillemiami.com", ig: "@cafebastillemiami", addr: "762 SW 8th St, Miami, FL 33130", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "miami-setai", name: "The Setai Miami Beach", cat: "Luxury Hotel", web: "https://www.thesetaihotel.com", ig: "@thesetai", addr: "2001 Collins Ave, Miami Beach, FL 33139", email: null, contact: "Marketing — thesetaihotel.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
      { id: "miami-edition", name: "The Miami Beach EDITION", cat: "Luxury Hotel", web: "https://www.editionhotels.com/miami-beach/", ig: "@editionhotels", addr: "2901 Collins Ave, Miami Beach, FL 33140", email: null, contact: "Marketing — editionhotels.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
      { id: "miami-nautilus", name: "Nautilus by Arlo", cat: "Boutique Hotel", web: "https://www.arlohotels.com/nautilus", ig: "@arlohotels", addr: "1825 Collins Ave, Miami Beach, FL 33139", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
      { id: "miami-freehand", name: "Freehand Miami", cat: "Boutique Hotel", web: "https://freehandhotels.com/miami/", ig: "@freehandhotels", addr: "2727 Indian Creek Dr, Miami Beach, FL 33140", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-sagamore", name: "The Sagamore Hotel", cat: "Boutique Hotel", web: "https://www.sagamoresouthbeach.com", ig: "@sagamoresouthbeach", addr: "1671 Collins Ave, Miami Beach, FL 33139", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "miami-panther", name: "Panther Coffee", cat: "Café", web: "https://www.panthercoffee.com", ig: "@panthercoffee", addr: "2390 NW 2nd Ave, Miami, FL 33127", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "miami-cecconis", name: "Cecconi's Miami Beach", cat: "Restaurant", web: "https://www.cecconismiamibeach.com", ig: "@cecconismiamibeach", addr: "176 Collins Ave, Miami Beach, FL 33139", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
      { id: "miami-surf-club", name: "Four Seasons Hotel at The Surf Club", cat: "Luxury Hotel", web: "https://www.fourseasons.com/surfside/", ig: "@fourseasons", addr: "9011 Collins Ave, Surfside, FL 33154", email: null, contact: "PR — fourseasons.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "miami-golden-fig", name: "The Golden Fig", cat: "Café", web: "https://www.thegoldenfig.com", ig: "@thegoldenfig", addr: "100 Collins Ave, Miami Beach, FL 33139", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    ],
  },
  {
    city: "new-york-city",
    state: "new-york",
    country: "united-states",
    biz: [
      { id: "nyc-bowery", name: "The Bowery Hotel", cat: "Boutique Hotel", web: "https://www.theboweryhotel.com", ig: "@theboweryhotel", addr: "335 Bowery, New York, NY 10003", email: "reservations@theboweryhotel.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
      { id: "nyc-crosby", name: "Crosby Street Hotel", cat: "Boutique Hotel", web: "https://www.firmdalehotels.com/hotels/crosby-street-hotel", ig: "@firmdalehotels", addr: "79 Crosby St, New York, NY 10012", email: "reservations@firmdalehotels.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
      { id: "nyc-ace", name: "Ace Hotel New York", cat: "Boutique Hotel", web: "https://acehotel.com/new-york/", ig: "@acehotel", addr: "20 W 29th St, New York, NY 10001", email: "nymedia@acehotel.com", contact: "Media — nymedia@acehotel.com", tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "nyc-public", name: "PUBLIC Hotel", cat: "Boutique Hotel", web: "https://publichotels.com", ig: "@publichotels", addr: "215 Chrystie St, New York, NY 10002", email: "hello@publichotels.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "nyc-balthazar", name: "Balthazar", cat: "Restaurant", web: "https://balthazarny.com", ig: "@balthazarny", addr: "80 Spring St, New York, NY 10012", email: null, contact: "Reservations & events — balthazarny.com", tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
      { id: "nyc-eleven-madison", name: "Eleven Madison Park", cat: "Restaurant", web: "https://www.elevenmadisonpark.com", ig: "@elevenmadisonpark", addr: "11 Madison Ave, New York, NY 10010", email: null, contact: "Press — elevenmadisonpark.com", tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
      { id: "nyc-standard-highline", name: "The Standard, High Line", cat: "Boutique Hotel", web: "https://www.standardhotels.com/new-york/properties/high-line", ig: "@standardhotels", addr: "848 Washington St, New York, NY 10014", email: "reservations@standardhotels.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
      { id: "nyc-ludlow", name: "The Ludlow Hotel", cat: "Boutique Hotel", web: "https://www.ludlowhotel.com", ig: "@ludlowhotel", addr: "180 Ludlow St, New York, NY 10002", email: "reservations@ludlowhotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "nyc-casablanca", name: "The Jane Hotel", cat: "Boutique Hotel", web: "https://www.thejanenyc.com", ig: "@thejanenyc", addr: "113 Jane St, New York, NY 10014", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "nyc-le-coucou", name: "Le Coucou", cat: "Restaurant", web: "https://www.lecoucou.com", ig: "@lecoucou", addr: "138 Lafayette St, New York, NY 10013", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
      { id: "nyc-blind-barber", name: "Blind Barber", cat: "Café", web: "https://www.blindbarber.com", ig: "@blindbarber", addr: "339 E 10th St, New York, NY 10009", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "nyc-beekman", name: "The Beekman, A Thompson Hotel", cat: "Boutique Hotel", web: "https://www.thebeekman.com", ig: "@thebeekman", addr: "123 Nassau St, New York, NY 10038", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    ],
  },
  {
    city: "los-angeles",
    state: "california",
    country: "united-states",
    biz: [
      { id: "la-proper", name: "Proper Hotel Downtown LA", cat: "Boutique Hotel", web: "https://www.properhotel.com/downtown-la/", ig: "@properhotel", addr: "1100 S Broadway, Los Angeles, CA 90015", email: "reservations@properhotel.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
      { id: "la-hollywood-roosevelt", name: "The Hollywood Roosevelt", cat: "Boutique Hotel", web: "https://www.thehollywoodroosevelt.com", ig: "@thehollywoodroosevelt", addr: "7000 Hollywood Blvd, Los Angeles, CA 90028", email: "reservations@thehollywoodroosevelt.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
      { id: "la-santa-monica-proper", name: "Santa Monica Proper Hotel", cat: "Luxury Hotel", web: "https://www.properhotel.com/santa-monica/", ig: "@properhotel", addr: "700 Wilshire Blvd, Santa Monica, CA 90401", email: "reservations@properhotel.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
      { id: "la-republique", name: "République", cat: "Restaurant", web: "https://republiquela.com", ig: "@republiquela", addr: "624 S La Brea Ave, Los Angeles, CA 90036", email: "info@republiquela.com", contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
      { id: "la-gracias-madre", name: "Gracias Madre", cat: "Restaurant", web: "https://www.graciasmadre.com", ig: "@graciasmadre", addr: "8905 Melrose Ave, West Hollywood, CA 90069", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "la-beverly-hills-hotel", name: "The Beverly Hills Hotel", cat: "Luxury Hotel", web: "https://www.dorchestercollection.com/en/los-angeles/the-beverly-hills-hotel/", ig: "@beverlyhillshotel", addr: "9641 Sunset Blvd, Beverly Hills, CA 90210", email: null, contact: "PR — Dorchester Collection media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "la-venice-v", name: "Hotel Venice V", cat: "Boutique Hotel", web: "https://www.venicevhotel.com", ig: "@venicevhotel", addr: "5 Rose Ave, Venice, CA 90291", email: "hello@venicevhotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    ],
  },
  {
    city: "paris",
    state: "ile-de-france",
    country: "france",
    biz: [
      { id: "paris-hoxton", name: "The Hoxton, Paris", cat: "Boutique Hotel", web: "https://thehoxton.com/paris/", ig: "@thehoxtonparis", addr: "30-32 Rue du Sentier, 75002 Paris, France", email: "paris@thehoxton.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "paris-hotel-particulier", name: "Hôtel Particulier Montmartre", cat: "Boutique Hotel", web: "https://www.hotelparticulier.com", ig: "@hotelparticulier", addr: "23 Avenue Junot, 75018 Paris, France", email: "contact@hotelparticulier.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
      { id: "paris-rosewood", name: "Hôtel de Crillon, A Rosewood Hotel", cat: "Luxury Hotel", web: "https://www.rosewoodhotels.com/en/hotel-de-crillon", ig: "@hoteldecrillon", addr: "10 Place de la Concorde, 75008 Paris, France", email: null, contact: "Partnerships — rosewoodhotels.com Paris property", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "paris-septime", name: "Septime", cat: "Restaurant", web: "https://www.septime-charonne.fr", ig: "@septime_restaurant", addr: "80 Rue de Charonne, 75011 Paris, France", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
      { id: "paris-cafe-de-flore", name: "Café de Flore", cat: "Restaurant", web: "https://www.cafedeflore.fr", ig: "@cafedeflore", addr: "172 Boulevard Saint-Germain, 75006 Paris, France", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "paris-le-bristol", name: "Le Bristol Paris", cat: "Luxury Hotel", web: "https://www.oetkercollection.com/hotels/le-bristol-paris/", ig: "@lebristolparis", addr: "112 Rue du Faubourg Saint-Honoré, 75008 Paris, France", email: null, contact: "PR — Oetker Collection media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "paris-mama-shelter", name: "Mama Shelter Paris East", cat: "Boutique Hotel", web: "https://mamashelter.com/paris-east", ig: "@mamashelter", addr: "109 Rue de Bagnolet, 75020 Paris, France", email: "paris-east@mamashelter.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "paris-shangri-la", name: "Shangri-La Paris", cat: "Luxury Hotel", web: "https://www.shangri-la.com/paris/shangrila/", ig: "@shangrilaparis", addr: "10 Avenue d'Iéna, 75116 Paris, France", email: null, contact: "Marketing — shangri-la.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    ],
  },
  {
    city: "london",
    state: "england",
    country: "united-kingdom",
    biz: [
      { id: "london-hoxton", name: "The Hoxton, Shoreditch", cat: "Boutique Hotel", web: "https://thehoxton.com/london/shoreditch/", ig: "@thehoxton", addr: "81 Great Eastern St, London EC2A 3HU, UK", email: "shoreditch@thehoxton.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
      { id: "london-rosewood", name: "Rosewood London", cat: "Luxury Hotel", web: "https://www.rosewoodhotels.com/en/rosewood-london", ig: "@rosewoodlondon", addr: "252 High Holborn, London WC1V 7EN, UK", email: null, contact: "Partnerships — rosewoodhotels.com London", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "london-chiltern", name: "The Chiltern Firehouse", cat: "Restaurant & Hotel", web: "https://www.chilternfirehouse.com", ig: "@chilternfirehouse", addr: "1 Chiltern St, London W1U 7PT, UK", email: null, contact: "Events — chilternfirehouse.com", tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 5 },
      { id: "london-dishoom", name: "Dishoom Covent Garden", cat: "Restaurant", web: "https://www.dishoom.com/covent-garden/", ig: "@dishoom", addr: "12 Upper St Martin's Ln, London WC2H 9FB, UK", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
      { id: "london-standard", name: "The Standard, London", cat: "Boutique Hotel", web: "https://www.standardhotels.com/london", ig: "@standardhotels", addr: "10 Argyle St, London WC1H 8EG, UK", email: "reservations@standardhotels.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
      { id: "london-connaught", name: "The Connaught", cat: "Luxury Hotel", web: "https://www.the-connaught.co.uk", ig: "@theconnaught", addr: "Carlos Place, London W1K 2AL, UK", email: null, contact: "PR — the-connaught.co.uk media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
      { id: "london-soho-house", name: "Soho House Greek Street", cat: "Boutique Hotel", web: "https://www.sohohouse.com/houses/soho-house-greek-street", ig: "@sohohouse", addr: "76-78 Greek St, London W1D 4BB, UK", email: null, contact: "Membership & events — sohohouse.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 4 },
      { id: "london-granger", name: "Granger & Co. Notting Hill", cat: "Restaurant", web: "https://grangerandco.com", ig: "@grangerandco", addr: "175 Westbourne Grove, London W11 2SB, UK", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    ],
  },
];

// Append more cities programmatically with template businesses for global scale
const MORE_CITIES: Array<{ city: string; state: string; country: string; label: string }> = [
  { city: "san-francisco", state: "california", country: "united-states", label: "San Francisco" },
  { city: "chicago", state: "illinois", country: "united-states", label: "Chicago" },
  { city: "austin", state: "texas", country: "united-states", label: "Austin" },
  { city: "nashville", state: "tennessee", country: "united-states", label: "Nashville" },
  { city: "charleston", state: "south-carolina", country: "united-states", label: "Charleston" },
  { city: "scottsdale", state: "arizona", country: "united-states", label: "Scottsdale" },
  { city: "las-vegas", state: "nevada", country: "united-states", label: "Las Vegas" },
  { city: "boston", state: "massachusetts", country: "united-states", label: "Boston" },
  { city: "washington-dc", state: "district-of-columbia", country: "united-states", label: "Washington DC" },
  { city: "rome", state: "lazio", country: "italy", label: "Rome" },
  { city: "barcelona", state: "catalonia", country: "spain", label: "Barcelona" },
  { city: "amsterdam", state: "north-holland", country: "netherlands", label: "Amsterdam" },
  { city: "lisbon", state: "lisbon", country: "portugal", label: "Lisbon" },
  { city: "berlin", state: "berlin", country: "germany", label: "Berlin" },
  { city: "milan", state: "lombardy", country: "italy", label: "Milan" },
  { city: "copenhagen", state: "capital-region", country: "denmark", label: "Copenhagen" },
  { city: "tulum", state: "quintana-roo", country: "mexico", label: "Tulum" },
  { city: "mexico-city", state: "cdmx", country: "mexico", label: "Mexico City" },
  { city: "buenos-aires", state: "buenos-aires", country: "argentina", label: "Buenos Aires" },
  { city: "sao-paulo", state: "sao-paulo", country: "brazil", label: "São Paulo" },
  { city: "cartagena", state: "bolivar", country: "colombia", label: "Cartagena" },
  { city: "punta-cana", state: "la-altagracia", country: "dominican-republic", label: "Punta Cana" },
  { city: "santo-domingo", state: "distrito-nacional", country: "dominican-republic", label: "Santo Domingo" },
  { city: "nassau", state: "new-providence", country: "bahamas", label: "Nassau" },
  { city: "san-juan", state: "puerto-rico", country: "united-states", label: "San Juan" },
  { city: "tokyo", state: "tokyo", country: "japan", label: "Tokyo" },
  { city: "singapore", state: "singapore", country: "singapore", label: "Singapore" },
  { city: "bali", state: "bali", country: "indonesia", label: "Bali" },
  { city: "dubai", state: "dubai", country: "united-arab-emirates", label: "Dubai" },
  { city: "abu-dhabi", state: "abu-dhabi", country: "united-arab-emirates", label: "Abu Dhabi" },
  { city: "bangkok", state: "bangkok", country: "thailand", label: "Bangkok" },
  { city: "doha", state: "doha", country: "qatar", label: "Doha" },
  { city: "sydney", state: "new-south-wales", country: "australia", label: "Sydney" },
  { city: "marrakech", state: "marrakech-safi", country: "morocco", label: "Marrakech" },
  { city: "cape-town", state: "western-cape", country: "south-africa", label: "Cape Town" },
  { city: "prague", state: "prague", country: "czech-republic", label: "Prague" },
];

const CITY_BUSINESS_TEMPLATES: Biz[][] = [
  [
    { id: "T1", name: "T1", cat: "Boutique Hotel", web: "https://example.com", ig: "@hotel", addr: "ADDR", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "T2", name: "T2", cat: "Restaurant", web: "https://example.com", ig: "@rest", addr: "ADDR", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "T3", name: "T3", cat: "Luxury Hotel", web: "https://example.com", ig: "@lux", addr: "ADDR", email: null, contact: "Marketing — property website", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "T4", name: "T4", cat: "Café", web: "https://example.com", ig: "@cafe", addr: "ADDR", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "T5", name: "T5", cat: "Luxury Villa", web: "https://example.com", ig: "@villa", addr: "ADDR", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "T6", name: "T6", cat: "Hospitality Experience", web: "https://example.com", ig: "@exp", addr: "ADDR", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
  ],
];

// Real named businesses per additional city (curated, not templates)
const NAMED_BY_CITY: Record<string, Biz[]> = {
  "san-francisco": [
    { id: "sf-proper", name: "San Francisco Proper Hotel", cat: "Boutique Hotel", web: "https://www.properhotel.com/san-francisco/", ig: "@properhotel", addr: "1100 Market St, San Francisco, CA 94102", email: "reservations@properhotel.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "sf-cavallo-point", name: "Cavallo Point Lodge", cat: "Luxury Hotel", web: "https://www.cavallopoint.com", ig: "@cavallopoint", addr: "601 Murray Cir, Sausalito, CA 94965", email: "reservations@cavallopoint.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "sf-tartine", name: "Tartine Manufactory", cat: "Restaurant", web: "https://tartinebakery.com/manufactory-san-francisco/", ig: "@tartinebakery", addr: "595 Alabama St, San Francisco, CA 94110", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "sf-fairmont", name: "Fairmont San Francisco", cat: "Luxury Hotel", web: "https://www.fairmont.com/san-francisco/", ig: "@fairmontsf", addr: "950 Mason St, San Francisco, CA 94108", email: null, contact: "PR — fairmont.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "sf-ace", name: "Ace Hotel San Francisco", cat: "Boutique Hotel", web: "https://acehotel.com/san-francisco/", ig: "@acehotel", addr: "1170 Market St, San Francisco, CA 94102", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "sf-nopa", name: "Nopa", cat: "Restaurant", web: "https://nopasf.com", ig: "@nopasf", addr: "560 Divisadero St, San Francisco, CA 94117", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
  ],
  tulum: [
    { id: "tulum-azulik", name: "Azulik", cat: "Luxury Hotel", web: "https://www.azulik.com", ig: "@azulik", addr: "Carretera Tulum-Boca Paila KM 5, Tulum, QR 77780, Mexico", email: null, contact: "Partnerships — azulik.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "tulum-be-tulum", name: "Be Tulum", cat: "Boutique Hotel", web: "https://www.betulum.com", ig: "@betulum", addr: "Carretera Tulum-Boca Paila KM 10, Tulum, QR 77780, Mexico", email: "reservations@betulum.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "tulum-habitas", name: "Habitas Tulum", cat: "Boutique Hotel", web: "https://www.ourhabitas.com/tulum/", ig: "@ourhabitas", addr: "Carretera Tulum-Boca Paila KM 8.5, Tulum, QR 77780, Mexico", email: null, contact: "Influencer Relations — ourhabitas.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "tulum-hartwood", name: "Hartwood", cat: "Restaurant", web: "https://www.hartwoodtulum.com", ig: "@hartwoodtulum", addr: "Carretera Tulum-Boca Paila, Tulum, QR 77780, Mexico", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
    { id: "tulum-nomade", name: "Nomade Tulum", cat: "Boutique Hotel", web: "https://nomadetulum.com", ig: "@nomadetulum", addr: "Carretera Tulum-Boca Paila KM 8, Tulum, QR 77780, Mexico", email: "hello@nomadetulum.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "tulum-papaya", name: "Papaya Playa Project", cat: "Resort", web: "https://www.papayaplayaproject.com", ig: "@papayaplayaproject", addr: "Carretera Tulum-Boca Paila KM 4.5, Tulum, QR 77780, Mexico", email: null, contact: "Events — papayaplayaproject.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
  ],
  dubai: [
    { id: "dubai-address", name: "Address Downtown", cat: "Luxury Hotel", web: "https://www.addresshotels.com/en/hotels/address-downtown/", ig: "@addresshotels", addr: "Mohammed Bin Rashid Blvd, Downtown Dubai, UAE", email: null, contact: "Marketing — Emaar Hospitality media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "dubai-jumeirah", name: "Jumeirah Al Naseem", cat: "Luxury Hotel", web: "https://www.jumeirah.com/en/hotel/jumeirah-al-naseem", ig: "@jumeirah", addr: "Madinat Jumeirah, Dubai, UAE", email: null, contact: "PR — jumeirah.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "dubai-sofitel", name: "Sofitel Dubai The Palm", cat: "Resort", web: "https://www.sofitel-dubai-thepalm.com", ig: "@sofiteldubaithepalm", addr: "East Crescent Rd, Palm Jumeirah, Dubai, UAE", email: "reservations@sofitel-dubai-thepalm.com", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "dubai-gaia", name: "GAIA Dubai", cat: "Restaurant", web: "https://gaiadubai.com", ig: "@gaiadubai", addr: "DIFC Gate Village 3, Dubai, UAE", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "dubai-25hours", name: "25hours Hotel One Central", cat: "Boutique Hotel", web: "https://www.25hours-hotels.com/dubai/one-central/", ig: "@25hourshotels", addr: "Trade Centre St, Dubai, UAE", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "dubai-la-perle", name: "La Perle by Dragone", cat: "Hospitality Experience", web: "https://www.laperle.com", ig: "@laperledubai", addr: "Al Habtoor City, Sheikh Zayed Rd, Dubai, UAE", email: null, contact: "Partnerships — laperle.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
  ],
  tokyo: [
    { id: "tokyo-aman", name: "Aman Tokyo", cat: "Luxury Hotel", web: "https://www.aman.com/hotels/aman-tokyo", ig: "@amanzoe", addr: "1-5-6 Otemachi, Chiyoda-ku, Tokyo 100-0004, Japan", email: null, contact: "PR — aman.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "tokyo-trunk", name: "Trunk Hotel", cat: "Boutique Hotel", web: "https://www.trunk-hotel.com", ig: "@trunkhotel", addr: "5-31 Jingumae, Shibuya-ku, Tokyo 150-0001, Japan", email: "info@trunk-hotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "tokyo-claska", name: "CLASKA Hotel & Restaurant", cat: "Boutique Hotel", web: "https://www.claska.com", ig: "@claska", addr: "1-3-18 Jingumae, Shibuya-ku, Tokyo 150-0001, Japan", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "tokyo-narisawa", name: "Narisawa", cat: "Restaurant", web: "https://www.narisawa-yoshihiro.com", ig: "@narisawa_restaurant", addr: "2-6-15 Minami-Aoyama, Minato-ku, Tokyo 107-0062, Japan", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "tokyo-park-hyatt", name: "Park Hyatt Tokyo", cat: "Luxury Hotel", web: "https://www.hyatt.com/en-US/hotel/japan/park-hyatt-tokyo/tyoph", ig: "@parkhyatttokyo", addr: "3-7-1-2 Nishi Shinjuku, Shinjuku-ku, Tokyo 163-1055, Japan", email: null, contact: "Marketing — hyatt.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "tokyo-k5", name: "K5", cat: "Boutique Hotel", web: "https://k5tokyo.com", ig: "@k5tokyo", addr: "3-5-10 Nihonbashi Kayabacho, Chuo-ku, Tokyo 103-0025, Japan", email: "hello@k5tokyo.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
  ],
};

// Fill remaining cities with real named properties from a compact list
const FILL_BUSINESSES: Record<string, Biz[]> = {
  chicago: [
    { id: "chi-soho", name: "Soho House Chicago", cat: "Boutique Hotel", web: "https://www.sohohouse.com/houses/soho-house-chicago", ig: "@sohohouse", addr: "113-125 N Green St, Chicago, IL 60607", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "chi-langham", name: "The Langham, Chicago", cat: "Luxury Hotel", web: "https://www.langhamhotels.com/en/the-langham/chicago/", ig: "@langhamhotels", addr: "330 N Wabash Ave, Chicago, IL 60611", email: null, contact: "PR — langhamhotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "chi-alinea", name: "Alinea", cat: "Restaurant", web: "https://www.alinearestaurant.com", ig: "@alinea", addr: "1723 N Halsted St, Chicago, IL 60614", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "chi-freehand", name: "Freehand Chicago", cat: "Boutique Hotel", web: "https://freehandhotels.com/chicago/", ig: "@freehandhotels", addr: "19 E Ohio St, Chicago, IL 60611", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 3 },
    { id: "chi-girl-goat", name: "Girl & The Goat", cat: "Restaurant", web: "https://www.girlandthegoat.com", ig: "@girlandthegoat", addr: "809 W Randolph St, Chicago, IL 60607", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
    { id: "chi-peninsula", name: "The Peninsula Chicago", cat: "Luxury Hotel", web: "https://www.peninsula.com/en/chicago/5-star-luxury-hotel-magnificent-mile", ig: "@peninsulahotels", addr: "108 E Superior St, Chicago, IL 60611", email: null, contact: "Marketing — peninsula.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  rome: [
    { id: "rome-hotel-locarno", name: "Hotel Locarno", cat: "Boutique Hotel", web: "https://www.hotellocarno.com", ig: "@hotellocarno", addr: "Via della Penna 22, 00186 Rome, Italy", email: "info@hotellocarno.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "rome-edition", name: "The Rome EDITION", cat: "Luxury Hotel", web: "https://www.editionhotels.com/rome/", ig: "@editionhotels", addr: "Salita di San Nicola da Tolentino 14, 00187 Rome, Italy", email: null, contact: "PR — editionhotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "rome-roscioli", name: "Roscioli", cat: "Restaurant", web: "https://www.salumeriaroscioli.com", ig: "@roscioli", addr: "Via dei Giubbonari 21, 00186 Rome, Italy", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
    { id: "rome-villa-spalletti", name: "Villa Spalletti Trivelli", cat: "Luxury Hotel", web: "https://www.villaspalletti.it", ig: "@villaspallettitrivelli", addr: "Via Piacenza 4, 00187 Rome, Italy", email: "info@villaspalletti.it", contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "rome-armando", name: "Armando al Pantheon", cat: "Restaurant", web: "https://www.armandoalpantheon.it", ig: "@armandoalpantheon", addr: "Salita dei Crescenzi 31, 00186 Rome, Italy", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "rome-hassler", name: "Hotel Hassler Roma", cat: "Luxury Hotel", web: "https://www.hotelhasslerroma.com", ig: "@hotelhasslerroma", addr: "Piazza Trinità dei Monti 6, 00187 Rome, Italy", email: null, contact: "PR — hotelhasslerroma.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
  ],
  barcelona: [
    { id: "bcn-cotton-house", name: "Cotton House Hotel", cat: "Boutique Hotel", web: "https://www.cottonhousehotel.com", ig: "@cottonhousehotel", addr: "Gran Via de les Corts Catalanes 670, 08010 Barcelona, Spain", email: "info@cottonhousehotel.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "bcn-w", name: "W Barcelona", cat: "Luxury Hotel", web: "https://www.marriott.com/en-us/hotels/bcnwh-w-barcelona/overview/", ig: "@wbarcelona", addr: "Plaça de la Rosa dels Vents 1, 08039 Barcelona, Spain", email: null, contact: "Marketing — marriott.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "bcn-tickets", name: "Tickets Bar", cat: "Restaurant", web: "https://www.ticketsbar.es", ig: "@ticketsbar", addr: "Avinguda del Paral·lel 164, 08015 Barcelona, Spain", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "bcn-yurbban", name: "Yurbban Passage Hotel & Spa", cat: "Boutique Hotel", web: "https://www.yurbban.com", ig: "@yurbban", addr: "Passatge de Sert 2, 08003 Barcelona, Spain", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "bcn-disfrutar", name: "Disfrutar", cat: "Restaurant", web: "https://www.disfrutarbarcelona.com", ig: "@disfrutarbcn", addr: "Carrer de Villarroel 163, 08036 Barcelona, Spain", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "bcn-soho", name: "Soho House Barcelona", cat: "Boutique Hotel", web: "https://www.sohohouse.com/houses/soho-house-barcelona", ig: "@sohohouse", addr: "Plaça del Duc de Medinaceli 4, 08002 Barcelona, Spain", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "bcn-casa-bonay", name: "Casa Bonay", cat: "Boutique Hotel", web: "https://www.casabonay.com", ig: "@casabonay", addr: "Gran Via de les Corts Catalanes 700, 08010 Barcelona, Spain", email: "hello@casabonay.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "bcn-el-nacional", name: "El Nacional", cat: "Restaurant", web: "https://www.elnacionalbcn.com", ig: "@elnacionalbcn", addr: "Pg. de Gràcia, 24, 08007 Barcelona, Spain", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "bcn-serras", name: "Hotel Serras Barcelona", cat: "Boutique Hotel", web: "https://www.hotelserras.com", ig: "@hotelserras", addr: "Passeig de Colom, 9, 08002 Barcelona, Spain", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "bcn-satan", name: "Satan's Coffee Corner", cat: "Café", web: "https://www.sataniscoffee.com", ig: "@sataniscoffee", addr: "Carrer de l'Arc de Sant Ramon del Call, 11, 08002 Barcelona, Spain", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
  ],
  "cape-town": [
    { id: "ct-silo", name: "The Silo Hotel", cat: "Luxury Hotel", web: "https://www.thesilohotel.com", ig: "@thesilohotel", addr: "Silo Square, V&A Waterfront, Cape Town 8001, South Africa", email: null, contact: "Partnerships — thesilohotel.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ct-taj", name: "Taj Cape Town", cat: "Luxury Hotel", web: "https://www.tajhotels.com/en-in/taj/taj-cape-town", ig: "@tajhotels", addr: "1 Wale St, Cape Town City Centre, 8001, South Africa", email: null, contact: "Marketing — tajhotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ct-gorgeous", name: "Gorgeous George Hotel", cat: "Boutique Hotel", web: "https://www.gorgeousgeorge.co.za", ig: "@gorgeousgeorgehotel", addr: "118 St Georges Mall, Cape Town City Centre, 8001, South Africa", email: "hello@gorgeousgeorge.co.za", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "ct-la-colombe", name: "La Colombe", cat: "Restaurant", web: "https://www.lacolomberestaurant.com", ig: "@lacolomberestaurant", addr: "Silvermist Wine Estate, Constantia Nek, Cape Town, South Africa", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 5 },
    { id: "ct-test-kitchen", name: "The Test Kitchen", cat: "Restaurant", web: "https://www.thetestkitchen.co.za", ig: "@thetestkitchen", addr: "The Old Biscuit Mill, 375 Albert Rd, Woodstock, Cape Town, South Africa", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "ct-rose", name: "The Rose Cape Town", cat: "Boutique Hotel", web: "https://www.therose.co.za", ig: "@therosecapetown", addr: "25 Rose St, Bo-Kaap, Cape Town, 8001, South Africa", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "ct-cape-grace", name: "Cape Grace, A Fairmont Managed Hotel", cat: "Luxury Hotel", web: "https://www.fairmont.com/cape-grace-cape-town/", ig: "@fairmont", addr: "West Quay Rd, Victoria & Alfred Waterfront, Cape Town, 8001, South Africa", email: null, contact: "PR — fairmont.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ct-origin", name: "Origin Coffee Roasting", cat: "Café", web: "https://www.origincoffeeroasting.co.za", ig: "@origincoffee", addr: "28 Hudson St, De Waterkant, Cape Town, 8001, South Africa", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "ct-12-apostles", name: "Twelve Apostles Hotel and Spa", cat: "Resort", web: "https://www.redcarnationhotels.com/twelve-apostles-hotel-and-spa", ig: "@redcarnationhotels", addr: "Victoria Rd, Camps Bay, Cape Town, 8005, South Africa", email: null, contact: "Influencer Relations — redcarnationhotels.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "ct-kloof", name: "Kloof Street House", cat: "Restaurant", web: "https://www.kloofstreethouse.com", ig: "@kloofstreethouse", addr: "133 Kloof St, Gardens, Cape Town, 8001, South Africa", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
  ],
  prague: [
    { id: "prg-augustine", name: "Augustine, a Luxury Collection Hotel", cat: "Luxury Hotel", web: "https://www.marriott.com/en-us/hotels/prglc-augustine-a-luxury-collection-hotel-prague/overview/", ig: "@luxurycollection", addr: "Letenská 33, 118 00 Malá Strana, Prague, Czech Republic", email: null, contact: "Marketing — marriott.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "prg-boho", name: "BoHo Hotel Prague", cat: "Boutique Hotel", web: "https://www.bohoprague.com", ig: "@bohoprague", addr: "Senovážné nám. 976/31, 110 00 Nové Město, Prague, Czech Republic", email: "info@bohoprague.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "prg-field", name: "Field Restaurant", cat: "Restaurant", web: "https://www.fieldrestaurant.cz", ig: "@fieldrestaurant", addr: "Štěpánská 623/40, 110 00 Nové Město, Prague, Czech Republic", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "prg-mosaic", name: "Mosaic House", cat: "Boutique Hotel", web: "https://www.mosaichouse.com", ig: "@mosaichouseprague", addr: "Odborů 278/4, 120 00 Nové Město, Prague, Czech Republic", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "prg-la-degustation", name: "La Degustation Bohême Bourgeoise", cat: "Restaurant", web: "https://www.ladegustation.cz", ig: "@ladegustation", addr: "Haštalská 18, 110 00 Staré Město, Prague, Czech Republic", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 5 },
    { id: "prg-emblem", name: "The Emblem Hotel", cat: "Boutique Hotel", web: "https://www.emblemprague.com", ig: "@emblemprague", addr: "Platnéřská 6, 110 00 Staré Město, Prague, Czech Republic", email: "info@emblemprague.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "prg-kavarna", name: "Kavárna Praha", cat: "Café", web: "https://www.kavarnapraha.cz", ig: "@kavarnapraha", addr: "Národní 22, 110 00 Nové Město, Prague, Czech Republic", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "prg-alchymist", name: "Alchymist Grand Hotel & Spa", cat: "Luxury Hotel", web: "https://www.alchymisthotel.com", ig: "@alchymisthotel", addr: "Tržiště 19, 118 00 Malá Strana, Prague, Czech Republic", email: null, contact: "Partnerships — alchymisthotel.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  "punta-cana": [
    { id: "pc-eden-roc", name: "Eden Roc Cap Cana", cat: "Luxury Hotel", web: "https://www.edenroccapcana.com", ig: "@edenroccapcana", addr: "Cap Cana, Punta Cana 23302, Dominican Republic", email: null, contact: "Partnerships — edenroccapcana.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "pc-excellence", name: "Excellence Punta Cana", cat: "Resort", web: "https://www.excellenceresorts.com/punta-cana/", ig: "@excellenceresorts", addr: "Playas Uvero Alto, Punta Cana, Dominican Republic", email: null, contact: "Influencer Relations — excellenceresorts.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "pc-hyatt-ziva", name: "Hyatt Ziva Cap Cana", cat: "Resort", web: "https://www.hyatt.com/en-US/hotel/dominican-republic/hyatt-ziva-cap-cana/pujzc", ig: "@hyatt", addr: "Cap Cana, Punta Cana, Dominican Republic", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "pc-trs", name: "TRS Cap Cana Hotel", cat: "Luxury Hotel", web: "https://www.trshotels.com/en/hotels/trs-cap-cana-hotel", ig: "@trshotels", addr: "Cap Cana, Punta Cana, Dominican Republic", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "pc-juanillo", name: "Juanillo Beach Club", cat: "Hospitality Experience", web: "https://www.capcana.com", ig: "@capcana", addr: "Cap Cana, Punta Cana, Dominican Republic", email: null, contact: "Tourism — capcana.com partnerships", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 4 },
    { id: "pc-zemi", name: "Zemi Beach House", cat: "Boutique Hotel", web: "https://www.zemibeach.com", ig: "@zemibeach", addr: "Playa Louises, Punta Cana, Dominican Republic", email: "reservations@zemibeach.com", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
  ],
  bali: [
    { id: "bali-como", name: "COMO Shambhala Estate", cat: "Luxury Hotel", web: "https://www.comohotels.com/bali/como-shambhala-estate", ig: "@comohotels", addr: "Banjar Begawan, Desa Melinggih Kelod, Payangan, Bali 80571, Indonesia", email: null, contact: "PR — comohotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "bali-potato-head", name: "Potato Head Suites", cat: "Boutique Hotel", web: "https://seminyak.potatohead.co/suites/", ig: "@potatoheadbali", addr: "Jl. Petitenget No.51B, Seminyak, Bali 80361, Indonesia", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "bali-mandapa", name: "Mandapa, a Ritz-Carlton Reserve", cat: "Luxury Hotel", web: "https://www.ritzcarlton.com/en/hotels/dpsub-mandapa-a-ritz-carlton-reserve/overview/", ig: "@ritzcarlton", addr: "Jl. Raya Kedewatan, Ubud, Bali 80571, Indonesia", email: null, contact: "Marketing — ritzcarlton.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "bali-mason", name: "Mason Adventures", cat: "Hospitality Experience", web: "https://www.balimasonadventures.com", ig: "@masonadventures", addr: "Jl. Raya Semaon, Badung, Bali 80361, Indonesia", email: null, contact: "Partnerships — balimasonadventures.com", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 4 },
    { id: "bali-locavore", name: "Locavore", cat: "Restaurant", web: "https://www.locavore.co.id", ig: "@locavore_ubud", addr: "Jl. Raya Sanggingan, Ubud, Bali 80571, Indonesia", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "bali-alila", name: "Alila Villas Uluwatu", cat: "Luxury Villa", web: "https://www.alilahotels.com/uluwatu", ig: "@alilahotels", addr: "Jl. Belimbing Sari, Pecatu, Bali 80364, Indonesia", email: null, contact: "Influencer Relations — alilahotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  singapore: [
    { id: "sg-warehouse", name: "The Warehouse Hotel", cat: "Boutique Hotel", web: "https://www.thewarehousehotel.com", ig: "@thewarehousehotel", addr: "320 Havelock Rd, Singapore 169628", email: "hello@thewarehousehotel.com", contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "sg-raffles", name: "Raffles Singapore", cat: "Luxury Hotel", web: "https://www.raffles.com/singapore/", ig: "@rafflessingapore", addr: "1 Beach Rd, Singapore 189673", email: null, contact: "PR — raffles.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "sg-lau-pa-sat", name: "Lau Pa Sat", cat: "Restaurant", web: "https://www.laupasat.com.sg", ig: "@laupasat", addr: "18 Raffles Quay, Singapore 048582", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "sg-mandarin", name: "Mandarin Oriental Singapore", cat: "Luxury Hotel", web: "https://www.mandarinoriental.com/en/singapore/marina-bay", ig: "@mosg", addr: "5 Raffles Ave, Singapore 039797", email: null, contact: "Marketing — mandarinoriental.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "sg-lvlup", name: "Lloyd's Inn", cat: "Boutique Hotel", web: "https://www.lloydsinn.com", ig: "@lloydsinn", addr: "2 Lloyd Rd, Singapore 239071", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 3 },
    { id: "sg-odette", name: "Odette", cat: "Restaurant", web: "https://odetterestaurant.com", ig: "@odetterestaurant", addr: "1 St Andrew's Rd, Singapore 178957", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
  ],
  austin: [
    { id: "aus-hotel-saint-cecilia", name: "Hotel Saint Cecilia", cat: "Boutique Hotel", web: "https://www.hotelsaintcecilia.com", ig: "@hotelsaintcecilia", addr: "1121 Academy Dr, Austin, TX 78704", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "aus-carpenters", name: "Carpenters Hall", cat: "Boutique Hotel", web: "https://www.carpentershall.com", ig: "@carpentershall", addr: "400 Josephine St, Austin, TX 78704", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "aus-uchi", name: "Uchi", cat: "Restaurant", web: "https://uchiaustin.com", ig: "@uchiaustin", addr: "801 S Lamar Blvd, Austin, TX 78704", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "aus-line", name: "The LINE Austin", cat: "Boutique Hotel", web: "https://www.thelinehotel.com/austin/", ig: "@thelinehotel", addr: "111 E Cesar Chavez St, Austin, TX 78701", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "aus-four-seasons", name: "Four Seasons Hotel Austin", cat: "Luxury Hotel", web: "https://www.fourseasons.com/austin/", ig: "@fourseasons", addr: "98 San Jacinto Blvd, Austin, TX 78701", email: null, contact: "PR — fourseasons.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "aus-sxsw", name: "SXSW Festival & Conference", cat: "Hospitality Experience", web: "https://www.sxsw.com", ig: "@sxsw", addr: "701 E 6th St, Austin, TX 78701", email: null, contact: "Partnerships — sxsw.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
  ],
  nashville: [
    { id: "nash-noelle", name: "Noelle", cat: "Boutique Hotel", web: "https://www.noelle-nashville.com", ig: "@noelle_nashville", addr: "200 4th Ave N, Nashville, TN 37219", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "nash-21c", name: "21c Museum Hotel Nashville", cat: "Boutique Hotel", web: "https://www.21cmuseumhotels.com/nashville/", ig: "@21cmuseumhotels", addr: "221 2nd Ave N, Nashville, TN 37201", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "nash-hattie-b", name: "Hattie B's Hot Chicken", cat: "Restaurant", web: "https://hattieb.com", ig: "@hattiebs", addr: "112 19th Ave S, Nashville, TN 37203", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "nash-josephine", name: "The Joseph", cat: "Luxury Hotel", web: "https://www.thejosephnashville.com", ig: "@thejosephnashville", addr: "401 Korean Veterans Blvd, Nashville, TN 37201", email: null, contact: "Marketing — thejosephnashville.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "nash-printers-alley", name: "Printers Alley", cat: "Hospitality Experience", web: "https://www.visitmusiccity.com", ig: "@visitmusiccity", addr: "Printers Alley, Nashville, TN 37201", email: null, contact: "Tourism — visitmusiccity.com", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 3 },
    { id: "nash-urban-cowboy", name: "Urban Cowboy Nashville", cat: "Boutique Hotel", web: "https://www.urbancowboy.com/nashville/", ig: "@urbancowboy", addr: "1603 Woodland St, Nashville, TN 37206", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
  ],
  amsterdam: [
    { id: "ams-pulitzer", name: "Hotel Pulitzer Amsterdam", cat: "Boutique Hotel", web: "https://www.hotelpulitzer.nl", ig: "@hotelpulitzer", addr: "Prinsengracht 315-331, 1016 GZ Amsterdam, Netherlands", email: "info@hotelpulitzer.nl", contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "ams-dylan", name: "The Dylan Amsterdam", cat: "Luxury Hotel", web: "https://www.dylanamsterdam.com", ig: "@dylanamsterdam", addr: "Keizersgracht 384, 1016 GB Amsterdam, Netherlands", email: null, contact: "PR — dylanamsterdam.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ams-rijs", name: "Restaurant Rijks", cat: "Restaurant", web: "https://www.restaurantrijks.nl", ig: "@restaurantrijks", addr: "Museumstraat 2, 1071 XX Amsterdam, Netherlands", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "ams-sir-albert", name: "Sir Albert Hotel", cat: "Boutique Hotel", web: "https://www.siralbert.nl", ig: "@siralberthotel", addr: "Albert Cuypstraat 2-6, 1072 CT Amsterdam, Netherlands", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "ams-waldorf", name: "Waldorf Astoria Amsterdam", cat: "Luxury Hotel", web: "https://www.hilton.com/en/hotels/amswawa-waldorf-astoria-amsterdam/", ig: "@waldorfastoria", addr: "Herengracht 542-556, 1017 CG Amsterdam, Netherlands", email: null, contact: "Marketing — hilton.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "ams-bakers", name: "Bakers & Roasters", cat: "Café", web: "https://www.bakersandroasters.com", ig: "@bakersandroasters", addr: "Eerste van der Helststraat 59, 1072 NZ Amsterdam, Netherlands", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
  ],
  lisbon: [
    { id: "lis-bairro", name: "Bairro Alto Hotel", cat: "Boutique Hotel", web: "https://www.bairroaltohotel.com", ig: "@bairroaltohotel", addr: "Praça Luís de Camões 2, 1200-243 Lisbon, Portugal", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "lis-memmo", name: "Memmo Príncipe Real", cat: "Boutique Hotel", web: "https://www.memmohotels.com/principe-real", ig: "@memmohotels", addr: "Rua Nova da Piedade 14, 1250-298 Lisbon, Portugal", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "lis-belcanto", name: "Belcanto", cat: "Restaurant", web: "https://www.belcanto.pt", ig: "@belcanto_restaurant", addr: "Rua Serpa Pinto 10A, 1200-444 Lisbon, Portugal", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "lis-four-seasons", name: "Four Seasons Hotel Ritz Lisbon", cat: "Luxury Hotel", web: "https://www.fourseasons.com/lisbon/", ig: "@fourseasons", addr: "Rua Rodrigo da Fonseca 88, 1250-319 Lisbon, Portugal", email: null, contact: "PR — fourseasons.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "lis-time-out", name: "Time Out Market Lisboa", cat: "Restaurant", web: "https://www.timeoutmarket.com/lisboa/", ig: "@timeoutmarketlisboa", addr: "Av. 24 de Julho 49, 1200-479 Lisbon, Portugal", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "lis-palacio", name: "Palácio Príncipe Real", cat: "Luxury Villa", web: "https://www.palacioprincipereal.com", ig: "@palacioprincipereal", addr: "Rua da Alegria 12, 1250-000 Lisbon, Portugal", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
  ],
  "mexico-city": [
    { id: "cdmx-condesa-df", name: "Condesa DF", cat: "Boutique Hotel", web: "https://www.grupohabita.com/condesa-df", ig: "@grupohabita", addr: "Av. Veracruz 102, Col. Condesa, 06700 Mexico City, Mexico", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "cdmx-pujol", name: "Pujol", cat: "Restaurant", web: "https://pujol.com.mx", ig: "@pujolmx", addr: "Tennyson 133, Polanco, 11560 Mexico City, Mexico", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "cdmx-four-seasons", name: "Four Seasons Mexico City", cat: "Luxury Hotel", web: "https://www.fourseasons.com/mexico/", ig: "@fourseasons", addr: "Paseo de la Reforma 500, 06600 Mexico City, Mexico", email: null, contact: "PR — fourseasons.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "cdmx-casa-luis", name: "Casa Luis Barragán", cat: "Hospitality Experience", web: "https://www.casaluisbarragan.org", ig: "@casaluisbarragan", addr: "Gral. Francisco Ramírez 12, 11840 Mexico City, Mexico", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "cdmx-rooma", name: "Roma Norte Boutique Hotels", cat: "Boutique Hotel", web: "https://www.visitmexico.com", ig: "@visitmexico", addr: "Colonia Roma Norte, 06700 Mexico City, Mexico", email: null, contact: "Tourism — visitmexico.com", tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 3 },
    { id: "cdmx-st-regis", name: "The St. Regis Mexico City", cat: "Luxury Hotel", web: "https://www.marriott.com/en-us/hotels/mexxr-the-st-regis-mexico-city/overview/", ig: "@stregishotels", addr: "Paseo de la Reforma 439, 06500 Mexico City, Mexico", email: null, contact: "Marketing — marriott.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  "buenos-aires": [
    { id: "ba-alvear", name: "Alvear Palace Hotel", cat: "Luxury Hotel", web: "https://www.alvearpalace.com", ig: "@alvearpalace", addr: "Av. Alvear 1891, C1129AAA Buenos Aires, Argentina", email: null, contact: "PR — alvearpalace.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "ba-hub", name: "Hub Porteño", cat: "Boutique Hotel", web: "https://www.hubporteno.com", ig: "@hubporteno", addr: "Rodríguez Peña 1967, C1021 Buenos Aires, Argentina", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "ba-don-julio", name: "Don Julio", cat: "Restaurant", web: "https://www.parrilladonjulio.com", ig: "@parrilladonjulio", addr: "Guatemala 4699, C1425 Buenos Aires, Argentina", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "ba-faena", name: "Faena Hotel Buenos Aires", cat: "Luxury Hotel", web: "https://www.faena.com/buenos-aires", ig: "@faenahotel", addr: "Martha Salotti 445, C1107CMB Buenos Aires, Argentina", email: null, contact: "Partnerships — faena.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ba-home", name: "Home Hotel Buenos Aires", cat: "Boutique Hotel", web: "https://www.homebuenosaires.com", ig: "@homebuenosaires", addr: "Honduras 5860, C1414BNF Buenos Aires, Argentina", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "ba-palacio-duhau", name: "Park Hyatt Palacio Duhau", cat: "Luxury Hotel", web: "https://www.hyatt.com/en-US/hotel/argentina/park-hyatt-buenos-aires/bueph", ig: "@parkhyatt", addr: "Av. Alvear 1661, C1014AAD Buenos Aires, Argentina", email: null, contact: "Marketing — hyatt.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  marrakech: [
    { id: "marr-la-mamounia", name: "La Mamounia", cat: "Luxury Hotel", web: "https://www.mamounia.com", ig: "@lamamounia_marrakech", addr: "Avenue Bab Jdid, 40040 Marrakech, Morocco", email: null, contact: "PR — mamounia.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "marr-riad", name: "Riad Yasmine", cat: "Boutique Hotel", web: "https://www.riadyasmine.com", ig: "@riadyasmine", addr: "43 Derb Chentouf, Marrakech 40000, Morocco", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "marr-nomad", name: "Le Nomade", cat: "Restaurant", web: "https://www.lenomademarrakech.com", ig: "@lenomademarrakech", addr: "Place des Épices, Marrakech 40000, Morocco", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "marr-royal-mansour", name: "Royal Mansour Marrakech", cat: "Luxury Hotel", web: "https://www.royalmansour.com/en/marrakech/", ig: "@royalmansour", addr: "Rue Abou Abbas El Sebti, Marrakech 40000, Morocco", email: null, contact: "Partnerships — royalmansour.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "marr-souk", name: "Marrakech Souks Experience", cat: "Hospitality Experience", web: "https://www.visitmorocco.com", ig: "@visitmorocco", addr: "Medina, Marrakech 40000, Morocco", email: null, contact: "Tourism — visitmorocco.com", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 3 },
    { id: "marr-riad-el-fenn", name: "Riad El Fenn", cat: "Boutique Hotel", web: "https://www.riadelfenn.com", ig: "@riadelfenn", addr: "2 Derb Moulay Abdullah Ben Hezzian, Marrakech 40000, Morocco", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
  ],
  bangkok: [
    { id: "bkk-siam", name: "Siam@Siam Design Hotel Bangkok", cat: "Boutique Hotel", web: "https://www.siamatbangkok.com", ig: "@siamatbangkok", addr: "865 Rama I Rd, Pathum Wan, Bangkok 10330, Thailand", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "bkk-mandarin", name: "Mandarin Oriental Bangkok", cat: "Luxury Hotel", web: "https://www.mandarinoriental.com/en/bangkok/chao-phraya-river", ig: "@mobangkok", addr: "48 Oriental Ave, Bangkok 10500, Thailand", email: null, contact: "PR — mandarinoriental.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "bkk-gaggan", name: "Gaggan Anand", cat: "Restaurant", web: "https://www.gaggananand.com", ig: "@gaggan_anand", addr: "68/1 Soi Langsuan, Bangkok 10330, Thailand", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "bkk-137", name: "137 Pillars Suites Bangkok", cat: "Luxury Hotel", web: "https://www.137pillarsbangkok.com", ig: "@137pillarsbangkok", addr: "59/1 Soi Sukhumvit 39, Bangkok 10110, Thailand", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "bkk-chatrium", name: "Chatrium Hotel Riverside Bangkok", cat: "Luxury Hotel", web: "https://www.chatrium.com/chatriumriversidebangkok", ig: "@chatriumhotels", addr: "28 Charoenkrung Soi 70, Bangkok 10120, Thailand", email: null, contact: "Influencer Relations — chatrium.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "bkk-jay-fai", name: "Jay Fai", cat: "Restaurant", web: "https://www.facebook.com/JayFaiRestaurant", ig: "@jayfai", addr: "327 Maha Chai Rd, Bangkok 10200, Thailand", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
  ],
  sydney: [
    { id: "syd-capella", name: "Capella Sydney", cat: "Luxury Hotel", web: "https://capellahotels.com/en/capella-sydney", ig: "@capellahotels", addr: "24 Hunter St, Sydney NSW 2000, Australia", email: null, contact: "PR — capellahotels.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "syd-ace", name: "Ace Hotel Sydney", cat: "Boutique Hotel", web: "https://acehotel.com/sydney/", ig: "@acehotel", addr: "47-53 Wentworth Ave, Sydney NSW 2000, Australia", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "syd-quay", name: "Quay Restaurant", cat: "Restaurant", web: "https://www.quay.com.au", ig: "@quayrestaurant", addr: "Upper Level, Overseas Passenger Terminal, Sydney NSW 2000, Australia", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "syd-park-hyatt", name: "Park Hyatt Sydney", cat: "Luxury Hotel", web: "https://www.hyatt.com/en-US/hotel/australia/park-hyatt-sydney/sydph", ig: "@parkhyattsydney", addr: "7 Hickson Rd, Sydney NSW 2000, Australia", email: null, contact: "Marketing — hyatt.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "syd-bondi", name: "Icebergs Dining Room", cat: "Restaurant", web: "https://icebergs.com.au", ig: "@icebergsdiningroomandbar", addr: "1 Notts Ave, Bondi Beach NSW 2026, Australia", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "syd-spicers", name: "Spicers Potts Point", cat: "Boutique Hotel", web: "https://www.spicersretreats.com/spicers-potts-point/", ig: "@spicersretreats", addr: "120 Victoria St, Potts Point NSW 2011, Australia", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
  ],
  charleston: [
    { id: "chs-zero-george", name: "Zero George Street", cat: "Boutique Hotel", web: "https://www.zerogeorge.com", ig: "@zerogeorge", addr: "0 George St, Charleston, SC 29401", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "chs-belmond", name: "Belmond Charleston Place", cat: "Luxury Hotel", web: "https://www.belmond.com/hotels/north-america/usa/sc/charleston/belmond-charleston-place/", ig: "@belmond", addr: "205 Meeting St, Charleston, SC 29401", email: null, contact: "PR — belmond.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "chs-fig", name: "FIG", cat: "Restaurant", web: "https://www.eatatfig.com", ig: "@eatatfig", addr: "232 Meeting St, Charleston, SC 29401", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
    { id: "chs-wentworth", name: "Wentworth Mansion", cat: "Boutique Hotel", web: "https://www.wentworthmansion.com", ig: "@wentworthmansion", addr: "149 Wentworth St, Charleston, SC 29401", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "chs-husk", name: "Husk", cat: "Restaurant", web: "https://huskrestaurant.com", ig: "@huskcharleston", addr: "76 Queen St, Charleston, SC 29401", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "chs-market", name: "Charleston City Market", cat: "Hospitality Experience", web: "https://www.thecharlestoncitymarket.com", ig: "@charlestoncitymarket", addr: "188 Meeting St, Charleston, SC 29401", email: null, contact: "Tourism — charlestoncvb.com", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 3 },
  ],
  "las-vegas": [
    { id: "lv-cosmopolitan", name: "The Cosmopolitan of Las Vegas", cat: "Luxury Hotel", web: "https://www.cosmopolitanlasvegas.com", ig: "@cosmopolitanvegas", addr: "3708 Las Vegas Blvd S, Las Vegas, NV 89109", email: null, contact: "Marketing — cosmopolitanlasvegas.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "lv-aria", name: "ARIA Resort & Casino", cat: "Luxury Hotel", web: "https://aria.mgmresorts.com", ig: "@aria", addr: "3730 Las Vegas Blvd S, Las Vegas, NV 89158", email: null, contact: "Influencer Relations — mgmresorts.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "lv-wakuda", name: "Wakuda Las Vegas", cat: "Restaurant", web: "https://www.wakudalasvegas.com", ig: "@wakudalasvegas", addr: "3799 Las Vegas Blvd S, Las Vegas, NV 89109", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "lv-delano", name: "Delano Las Vegas", cat: "Boutique Hotel", web: "https://www.delanolasvegas.com", ig: "@delanolasvegas", addr: "3940 Las Vegas Blvd S, Las Vegas, NV 89119", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "lv-nobu", name: "Nobu Hotel Caesars Palace", cat: "Luxury Hotel", web: "https://www.caesars.com/nobu-hotel-las-vegas", ig: "@nobuhotels", addr: "3570 Las Vegas Blvd S, Las Vegas, NV 89109", email: null, contact: null, tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "lv-sphere", name: "Sphere", cat: "Hospitality Experience", web: "https://www.thespherevegas.com", ig: "@thespherevegas", addr: "255 Sands Ave, Las Vegas, NV 89169", email: null, contact: "Partnerships — thespherevegas.com", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
  ],
  boston: [
    { id: "bos-liberty", name: "The Liberty, a Luxury Collection Hotel", cat: "Luxury Hotel", web: "https://www.libertyhotel.com", ig: "@libertyhotel", addr: "215 Charles St, Boston, MA 02114", email: null, contact: "PR — marriott.com media", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "bos-verb", name: "The Verb Hotel", cat: "Boutique Hotel", web: "https://www.theverbhotel.com", ig: "@theverbhotel", addr: "1271 Boylston St, Boston, MA 02215", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "bos-uniqlo", name: "Uni", cat: "Restaurant", web: "https://uni-boston.com", ig: "@uniboston", addr: "370 Commonwealth Ave, Boston, MA 02215", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "bos-fifteen", name: "Fifteen Beacon", cat: "Boutique Hotel", web: "https://www.fifteenbeacon.com", ig: "@fifteenbeacon", addr: "15 Beacon St, Boston, MA 02108", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 4 },
    { id: "bos-oleana", name: "Oleana", cat: "Restaurant", web: "https://www.oleanarestaurant.com", ig: "@oleanarestaurant", addr: "134 Hampshire St, Cambridge, MA 02139", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 3 },
    { id: "bos-four-seasons", name: "Four Seasons Hotel Boston", cat: "Luxury Hotel", web: "https://www.fourseasons.com/boston/", ig: "@fourseasons", addr: "200 Boylston St, Boston, MA 02116", email: null, contact: "PR — fourseasons.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
  cartagena: [
    { id: "ctg-sofitel", name: "Sofitel Legend Santa Clara Cartagena", cat: "Luxury Hotel", web: "https://www.sofitellegendsantaclara.com", ig: "@sofitel", addr: "Calle del Torno 39-29, Cartagena, Colombia", email: null, contact: "Marketing — sofitel.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ctg-casa-san-agustin", name: "Casa San Agustin", cat: "Boutique Hotel", web: "https://www.hotelcasasanagustin.com", ig: "@hotelcasasanagustin", addr: "Calle de la Universidad 36-122, Cartagena, Colombia", email: null, contact: null, tier: "boutique", pitch: "boutique-hotel", opp: 4, diff: 3, val: 5 },
    { id: "ctg-cevicheria", name: "La Cevicheria", cat: "Restaurant", web: "https://www.lacevicheria.com", ig: "@lacevicheria", addr: "Calle Stuart 7-14, Cartagena, Colombia", email: null, contact: null, tier: "local", pitch: "restaurant", opp: 5, diff: 2, val: 4 },
    { id: "ctg-bastion", name: "Bastión Luxury Hotel", cat: "Luxury Hotel", web: "https://www.hotelbastion.com", ig: "@hotelbastion", addr: "Calle del Estanco 52, Cartagena, Colombia", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 5 },
    { id: "ctg-leo", name: "LEO", cat: "Restaurant", web: "https://www.leo-colombia.com", ig: "@leo_colombia", addr: "Calle 35 #8-21, Cartagena, Colombia", email: null, contact: null, tier: "stretch", pitch: "restaurant", opp: 3, diff: 5, val: 5 },
    { id: "ctg-walled-city", name: "Cartagena Walled City Tours", cat: "Hospitality Experience", web: "https://www.colombia.travel", ig: "@colombia.travel", addr: "Centro Histórico, Cartagena, Colombia", email: null, contact: "Tourism — colombia.travel", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 3 },
  ],
  "san-juan": [
    { id: "sj-condado-vanderbilt", name: "Condado Vanderbilt Hotel", cat: "Luxury Hotel", web: "https://www.condadovanderbilt.com", ig: "@condadovanderbilt", addr: "1055 Ashford Ave, San Juan, PR 00907", email: null, contact: "PR — condadovanderbilt.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "sj-dorado-beach", name: "Dorado Beach, a Ritz-Carlton Reserve", cat: "Resort", web: "https://www.ritzcarlton.com/en/hotels/sjudo-dorado-beach-a-ritz-carlton-reserve/overview/", ig: "@ritzcarlton", addr: "500 Plantation Dr, Dorado, PR 00646", email: null, contact: "Marketing — ritzcarlton.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "sj-marmalade", name: "Marmalade Restaurant", cat: "Restaurant", web: "https://www.marmaladepr.com", ig: "@marmaladepr", addr: "317 Calle Fortaleza, San Juan, PR 00901", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "sj-ocean-club", name: "O:LV Fifty Five", cat: "Boutique Hotel", web: "https://www.olvhotels.com", ig: "@olvhotels", addr: "55 Calle Aguadilla, San Juan, PR 00907", email: null, contact: null, tier: "local", pitch: "boutique-hotel", opp: 5, diff: 2, val: 4 },
    { id: "sj-la-concha", name: "La Concha Renaissance Resort", cat: "Resort", web: "https://www.marriott.com/en-us/hotels/sjulc-la-concha-renaissance-san-juan-resort/overview/", ig: "@marriott", addr: "1077 Ashford Ave, San Juan, PR 00907", email: null, contact: null, tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "sj-old-san-juan", name: "Old San Juan Heritage District", cat: "Hospitality Experience", web: "https://www.discoverpuertorico.com", ig: "@discoverpuertorico", addr: "Old San Juan, San Juan, PR 00901", email: null, contact: "Tourism — discoverpuertorico.com", tier: "local", pitch: "hosted-stay", opp: 5, diff: 2, val: 3 },
  ],
  "abu-dhabi": [
    { id: "ad-emirates-palace", name: "Emirates Palace Mandarin Oriental", cat: "Luxury Hotel", web: "https://www.mandarinoriental.com/en/abu-dhabi/emirates-palace", ig: "@emiratespalace", addr: "West Corniche Rd, Abu Dhabi, UAE", email: null, contact: "PR — mandarinoriental.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "ad-saadiyat", name: "Saadiyat Beach Club", cat: "Hospitality Experience", web: "https://www.saadiyat.ae", ig: "@saadiyat", addr: "Saadiyat Island, Abu Dhabi, UAE", email: null, contact: "Partnerships — saadiyat.ae", tier: "boutique", pitch: "hosted-stay", opp: 4, diff: 3, val: 4 },
    { id: "ad-qasr", name: "Qasr Al Sarab Desert Resort", cat: "Resort", web: "https://www.anantara.com/en/qasr-al-sarab-abu-dhabi", ig: "@anantara", addr: "Qasr Al Sarab Road, Abu Dhabi, UAE", email: null, contact: "Influencer Relations — anantara.com", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
    { id: "ad-zaya", name: "Zaya Nurai Island", cat: "Luxury Villa", web: "https://www.zayanuraiisland.com", ig: "@zayanuraiisland", addr: "Nurai Island, Abu Dhabi, UAE", email: null, contact: null, tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 5, val: 5 },
    { id: "ad-cipriani", name: "Cipriani Yas Island", cat: "Restaurant", web: "https://www.cipriani.com/yas", ig: "@cipriani", addr: "Yas Marina, Abu Dhabi, UAE", email: null, contact: null, tier: "boutique", pitch: "restaurant", opp: 4, diff: 3, val: 4 },
    { id: "ad-rosewood", name: "Rosewood Abu Dhabi", cat: "Luxury Hotel", web: "https://www.rosewoodhotels.com/en/abu-dhabi", ig: "@rosewoodabudhabi", addr: "Al Maryah Island, Abu Dhabi, UAE", email: null, contact: "Partnerships — rosewoodhotels.com Abu Dhabi", tier: "stretch", pitch: "hosted-stay", opp: 3, diff: 4, val: 5 },
  ],
};

for (const meta of MORE_CITIES) {
  const named = NAMED_BY_CITY[meta.city] ?? FILL_BUSINESSES[meta.city];
  if (named) {
    cities.push({ city: meta.city, state: meta.state, country: meta.country, biz: named });
  }
}

const totalBiz = cities.reduce((n, c) => n + c.biz.length, 0);
console.log(`Generating ${totalBiz} businesses across ${cities.length} cities`);

const outPath = join(process.cwd(), "src/lib/dashboard/partnership-directory-raw.ts");
const header = `/** AUTO-GENERATED — run: npx tsx scripts/generate-partnership-directory.mts */\n\n`;
const body = `export type RawPartnershipEntry = {\n  id: string;\n  businessName: string;\n  category: string;\n  city: string;\n  state: string;\n  country: string;\n  tier: "local" | "boutique" | "stretch";\n  website: string;\n  instagram: string;\n  address: string;\n  contactEmail: string | null;\n  contactPerson: string | null;\n  pitchTemplateId: string;\n  opportunityScore: number;\n  difficultyScore: number;\n  valueScore: number;\n};\n\nexport const RAW_PARTNERSHIP_ENTRIES: RawPartnershipEntry[] = ${JSON.stringify(
  cities.flatMap((c) =>
    c.biz.map((b) => ({
      id: b.id,
      businessName: b.name,
      category: b.cat,
      city: c.city,
      state: c.state,
      country: c.country,
      tier: b.tier,
      website: b.web,
      instagram: b.ig,
      address: b.addr,
      contactEmail: b.email,
      contactPerson: b.contact,
      pitchTemplateId: b.pitch,
      opportunityScore: b.opp,
      difficultyScore: b.diff,
      valueScore: b.val,
    }))
  ),
  null,
  2
)};\n`;

writeFileSync(outPath, header + body);
console.log(`Wrote ${outPath}`);

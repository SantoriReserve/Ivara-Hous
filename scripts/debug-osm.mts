import { geocodeLocation, fetchOsmHospitalityPlaces } from "../src/lib/dashboard/partnership-osm";

async function main() {
  for (const loc of [
    { city: "Miami", state: "Florida", country: "United States" },
    { city: "Cape Town", state: "", country: "South Africa" },
  ]) {
    console.log("\n---", loc.city, "---");
    const geo = await geocodeLocation(loc);
    console.log("geo:", geo);
    if (geo) {
      const radius = 12000;
      const q = `[out:json][timeout:25];node["tourism"="hotel"](around:${radius},${geo.lat},${geo.lon});out body 10;`;
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(q)}`,
      });
      console.log("overpass status", res.status);
      const json = await res.json();
      console.log("elements", json.elements?.length);
      const places = await fetchOsmHospitalityPlaces(geo, 15);
      console.log("places:", places.length, places.map((p) => p.name).slice(0, 5));
    }
  }
}

main();

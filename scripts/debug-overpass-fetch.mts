const q = `[out:json][timeout:25];node["tourism"="hotel"](around:8000,25.7741566,-80.1935973);out body 5;`;

const attempts = [
  {
    name: "POST urlencoded",
    init: {
      method: "POST" as const,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: q }).toString(),
    },
  },
  {
    name: "GET query",
    init: { method: "GET" as const },
    url: `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`,
  },
  {
    name: "kumi POST",
    init: {
      method: "POST" as const,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ data: q }).toString(),
    },
    url: "https://overpass.kumi.systems/api/interpreter",
  },
];

for (const attempt of attempts) {
  const url = attempt.url ?? "https://overpass-api.de/api/interpreter";
  const res = await fetch(url, attempt.init);
  const text = await res.text();
  console.log(attempt.name, res.status, text.slice(0, 120));
}

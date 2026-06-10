/**
 * Form workflow smoke test (local script — not part of production build).
 * Run: npx tsx scripts/verify-form-workflows.mts
 */
const PRODUCTION_URL = process.env.VERIFY_URL ?? "https://www.ivarahous.com";

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name} — ${detail}`);
}

try {
  const creatorRes = await fetch(`${PRODUCTION_URL}/api/creator-application`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Public API Verify",
      email: `public-creator-${Date.now()}@ivarahous.com`,
      location: "Test",
      instagram: "@test",
      tiktok: "",
      followerCount: "under-10k",
      niche: "Test",
      portfolio: "",
      motivation: "Public route verification",
      experience: "",
      contentSamples: "",
    }),
  });
  const creatorJson = (await creatorRes.json()) as { success?: boolean };
  record(
    "Creator public submission (Make + Supabase additive)",
    creatorRes.ok && Boolean(creatorJson.success),
    `HTTP ${creatorRes.status}`
  );
} catch (error) {
  record(
    "Creator public submission",
    false,
    error instanceof Error ? error.message : "Request failed"
  );
}

for (const [label, path, body] of [
  [
    "Partner public submission",
    "/api/partner-with-us",
    {
      contactName: "Public API Verify",
      email: `public-partner-${Date.now()}@ivarahous.com`,
      propertyName: "Verify Property",
      location: "Test",
      website: "",
      propertyType: "hotel",
      services: "hospitality-growth-partner",
      goals: "Public route verification",
      previousCollaborations: "",
    },
  ],
  [
    "Contact public submission",
    "/api/contact",
    {
      name: "Public API Verify",
      email: `public-contact-${Date.now()}@ivarahous.com`,
      inquiryType: "general",
      subject: "Public route verification",
      message: "Smoke test only",
    },
  ],
] as const) {
  try {
    const res = await fetch(`${PRODUCTION_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { success?: boolean };
    record(label, res.ok && Boolean(json.success), `HTTP ${res.status}`);
  } catch (error) {
    record(label, false, error instanceof Error ? error.message : "Request failed");
  }
}

const passed = checks.filter((c) => c.pass).length;
console.log(`\n---\nForm workflow verification: ${passed}/${checks.length} passed`);
process.exit(checks.every((c) => c.pass) ? 0 : 1);

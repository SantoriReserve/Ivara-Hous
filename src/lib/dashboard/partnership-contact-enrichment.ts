import { fetchWithTimeout } from "@/lib/dashboard/partnership-fetch-utils";
import {
  buildDiscoveredContactIntel,
  extractEmailsFromHtml,
  extractInstagramFromHtml,
  emptyContactIntel,
  finalizeContactIntel,
  mergeContactEmails,
} from "@/lib/dashboard/partnership-contact-intelligence";
import type { PartnershipContactIntel } from "@/lib/dashboard/partnership-contact-types";
import { normalizeWebsiteUrl } from "@/lib/dashboard/partnership-result-utils";

const CONTACT_PATHS = ["/contact", "/press", "/media", "/partnerships", "/collaborate"];

async function fetchPageHtml(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, {
      timeoutMs: 3000,
      headers: {
        "User-Agent": "IvaraHous/1.0 (partnership-contact-enrichment)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;
    return (await res.text()).slice(0, 180_000);
  } catch {
    return null;
  }
}

function originFromUrl(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export async function fetchContactIntelligenceFromWebsite(
  website: string,
  seed?: Partial<PartnershipContactIntel>
): Promise<PartnershipContactIntel> {
  const normalized = normalizeWebsiteUrl(website);
  if (!normalized) return emptyContactIntel();

  const origin = originFromUrl(normalized);
  if (!origin) {
    return finalizeContactIntel({
      website: null,
      instagram: null,
      emails: seed?.emails ?? [],
      contactPerson: seed?.contactPerson ?? null,
      phone: seed?.phone ?? null,
    });
  }

  const pagesToFetch = [normalized, ...CONTACT_PATHS.map((path) => `${origin}${path}`)];
  const uniquePages = [...new Set(pagesToFetch)].slice(0, 4);

  let combinedHtml = "";
  let websiteReachable = false;

  for (const pageUrl of uniquePages) {
    const html = await fetchPageHtml(pageUrl);
    if (!html) continue;
    websiteReachable = true;
    combinedHtml += `\n${html}`;
  }

  const emails = mergeContactEmails(seed?.emails ?? [], extractEmailsFromHtml(combinedHtml, normalized));
  const instagramFromSite = extractInstagramFromHtml(combinedHtml);

  let instagram = seed?.instagram ?? null;
  if (instagramFromSite) {
    instagram = { handle: instagramFromSite, confidence: "verified" };
  }

  return finalizeContactIntel({
    website: websiteReachable ? { url: normalized, confidence: "verified" } : null,
    instagram,
    emails,
    contactPerson: seed?.contactPerson ?? null,
    phone: seed?.phone ?? null,
  });
}

export async function enrichContactForWebsites(
  entries: Array<{ id: string; website: string | null; phone?: string | null }>,
  maxConcurrent = 4
): Promise<Array<{ id: string; contact: PartnershipContactIntel }>> {
  const pending = entries.filter((entry) => entry.website);
  if (pending.length === 0) return [];

  const results: Array<{ id: string; contact: PartnershipContactIntel }> = [];

  for (let index = 0; index < pending.length; index += maxConcurrent) {
    const batch = pending.slice(index, index + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(async (entry) => {
        const seed = buildDiscoveredContactIntel({
          website: entry.website,
          phone: entry.phone,
        });
        const contact = await fetchContactIntelligenceFromWebsite(entry.website!, seed);
        return { id: entry.id, contact };
      })
    );
    results.push(...batchResults);
  }

  return results;
}

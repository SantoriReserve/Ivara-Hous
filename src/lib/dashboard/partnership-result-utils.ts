import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";

const GENERIC_NAME_PATTERNS = [
  /^independent boutique hotels/i,
  /^chef-led restaurants/i,
  /^design cafés/i,
  /^design cafes/i,
  /^local boutique hotels/i,
  /^local dining partners/i,
  /^café ugc/i,
  /^cafe ugc/i,
  /\bhotels in\b/i,
  /\brestaurants in\b/i,
  /\bcafés in\b/i,
  /\bcafes in\b/i,
  /^find \d+/i,
  /^local \w+ partners/i,
  /\bboutique hotels\b.*\bin\b/i,
];

const GENERIC_CATEGORY_PATTERNS = [
  /^local boutique hotels$/i,
  /^local dining partners$/i,
  /^café ugc$/i,
  /^cafe ugc$/i,
];

export function isGenericOpportunityName(name: string): boolean {
  return GENERIC_NAME_PATTERNS.some((pattern) => pattern.test(name.trim()));
}

export function isGenericOpportunityCategory(category: string): boolean {
  return GENERIC_CATEGORY_PATTERNS.some((pattern) => pattern.test(category.trim()));
}

export function isVerifiedPartnershipOpportunity(opp: PartnershipOpportunity): boolean {
  if (isGenericOpportunityName(opp.businessName)) return false;
  if (isGenericOpportunityCategory(opp.category)) return false;
  if (opp.website.includes("google.com/search")) return false;
  if (/instagram — search/i.test(opp.instagram)) return false;
  if (/instagram search:/i.test(opp.instagram)) return false;
  return true;
}

export function normalizeWebsiteUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const value = raw.trim();
  if (value.includes("google.com/search")) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://${value.replace(/^\/\//, "")}`;
}

export function normalizeInstagramHandle(
  tags: Record<string, string> | null | undefined,
  name?: string
): string | null {
  const candidates = [
    tags?.["contact:instagram"],
    tags?.instagram,
    tags?.["contact:social"],
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const handle = raw
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/\/.*$/, "")
      .replace(/^@/, "");
    if (handle && handle.length >= 2 && !handle.includes(" ")) {
      return `@${handle}`;
    }
  }

  if (name && /instagram — search/i.test(name)) return null;
  return null;
}

export function formatInstagramDisplay(handle: string | null | undefined): string {
  if (!handle?.trim()) return "Not available";
  const normalized = handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`;
  return normalized;
}

export function formatWebsiteDisplay(website: string | null | undefined): string {
  if (!website?.trim() || website.includes("google.com/search")) return "Not available";
  return website.trim();
}

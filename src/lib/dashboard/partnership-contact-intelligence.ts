import type { DirectoryBusiness } from "@/lib/dashboard/partnership-directory-types";
import type { CachedPartnershipPlace } from "@/lib/dashboard/partnership-cache-repository";
import {
  type ContactConfidence,
  type ContactEmailEntry,
  type PartnershipContactIntel,
  UNAVAILABLE_LABEL,
} from "@/lib/dashboard/partnership-contact-types";
import { normalizeWebsiteUrl } from "@/lib/dashboard/partnership-result-utils";

const EMAIL_PATTERN =
  /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

const DEPARTMENT_RULES: Array<{ test: RegExp; department: string; priority: number }> = [
  { test: /^partnerships?$/i, department: "Partnerships", priority: 1 },
  { test: /^collaborations?$/i, department: "Collaborations", priority: 1 },
  { test: /^influencer/i, department: "Influencer Partnerships", priority: 1 },
  { test: /^creator/i, department: "Creator Partnerships", priority: 1 },
  { test: /^marketing$/i, department: "Marketing", priority: 2 },
  { test: /^media$/i, department: "Media", priority: 3 },
  { test: /^press$/i, department: "Press", priority: 3 },
  { test: /^pr$/i, department: "PR", priority: 3 },
  { test: /^communications?$/i, department: "Communications", priority: 3 },
  { test: /^events?$/i, department: "Events", priority: 4 },
  { test: /^sales$/i, department: "Sales", priority: 5 },
  { test: /^info$/i, department: "General", priority: 6 },
  { test: /^contact$/i, department: "General", priority: 6 },
  { test: /^hello$/i, department: "General", priority: 6 },
  { test: /^reservations?$/i, department: "Reservations", priority: 7 },
];

const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "email.com",
  "domain.com",
  "sentry.io",
  "wixpress.com",
  "schema.org",
]);

const BLOCKED_INSTAGRAM_HANDLES = new Set([
  "instagram",
  "explore",
  "accounts",
  "about",
  "legal",
  "privacy",
  "p",
  "reel",
  "reels",
  "stories",
]);

function domainFromUrl(url: string): string | null {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function domainFromEmail(email: string): string | null {
  const parts = email.split("@");
  return parts.length === 2 ? parts[1]!.replace(/^www\./, "").toLowerCase() : null;
}

function classifyEmailLocalPart(localPart: string): { department: string; priority: number } {
  for (const rule of DEPARTMENT_RULES) {
    if (rule.test.test(localPart)) {
      return { department: rule.department, priority: rule.priority };
    }
  }
  return { department: "General", priority: 8 };
}

export function classifyEmail(email: string): ContactEmailEntry {
  const normalized = email.trim().toLowerCase();
  const localPart = normalized.split("@")[0] ?? "";
  const { department, priority } = classifyEmailLocalPart(localPart);
  return {
    email: normalized,
    department,
    confidence: priority <= 3 ? "verified" : "likely",
  };
}

export function sortContactEmails(emails: ContactEmailEntry[]): ContactEmailEntry[] {
  return [...emails].sort((a, b) => {
    const priorityA =
      DEPARTMENT_RULES.find((rule) => rule.department === a.department)?.priority ?? 8;
    const priorityB =
      DEPARTMENT_RULES.find((rule) => rule.department === b.department)?.priority ?? 8;
    if (priorityA !== priorityB) return priorityA - priorityB;
    if (a.confidence !== b.confidence) {
      return a.confidence === "verified" ? -1 : 1;
    }
    return a.email.localeCompare(b.email);
  });
}

export function extractEmailsFromHtml(html: string, websiteUrl: string): ContactEmailEntry[] {
  const siteDomain = domainFromUrl(websiteUrl);
  if (!siteDomain) return [];

  const found = new Set<string>();
  const entries: ContactEmailEntry[] = [];

  for (const match of html.matchAll(EMAIL_PATTERN)) {
    const raw = match[0]?.toLowerCase();
    if (!raw || found.has(raw)) continue;

    const emailDomain = domainFromEmail(raw);
    if (!emailDomain || BLOCKED_EMAIL_DOMAINS.has(emailDomain)) continue;
    if (!emailDomain.endsWith(siteDomain) && siteDomain !== emailDomain) {
      const siteRoot = siteDomain.split(".").slice(-2).join(".");
      const emailRoot = emailDomain.split(".").slice(-2).join(".");
      if (siteRoot !== emailRoot) continue;
    }

    found.add(raw);
    entries.push({
      ...classifyEmail(raw),
      confidence: html.includes(`mailto:${raw}`) ? "verified" : "likely",
    });
  }

  return sortContactEmails(entries);
}

export function extractInstagramFromHtml(html: string): string | null {
  const patterns = [
    /https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9._]+)/gi,
    /"(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-z0-9._]+)"/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const handle = match[1]?.toLowerCase();
      if (!handle || BLOCKED_INSTAGRAM_HANDLES.has(handle)) continue;
      if (handle.length < 2 || handle.length > 30) continue;
      return `@${handle}`;
    }
  }

  return null;
}

export function mergeContactEmails(
  existing: ContactEmailEntry[],
  incoming: ContactEmailEntry[]
): ContactEmailEntry[] {
  const byEmail = new Map<string, ContactEmailEntry>();
  for (const entry of [...existing, ...incoming]) {
    const current = byEmail.get(entry.email);
    if (!current || entry.confidence === "verified") {
      byEmail.set(entry.email, entry);
    }
  }
  return sortContactEmails([...byEmail.values()]);
}

function buildOutreachGuidance(intel: Omit<PartnershipContactIntel, "outreachGuidance">): string {
  const topEmail = sortContactEmails(intel.emails)[0];
  if (topEmail && ["Partnerships", "Collaborations", "Marketing", "Media", "Press", "PR"].includes(topEmail.department)) {
    return `Email ${topEmail.email} (${topEmail.department})`;
  }
  if (topEmail) {
    return `Email ${topEmail.email}`;
  }
  if (intel.contactPerson?.confidence === "verified") {
    const title = intel.contactPerson.title ? ` — ${intel.contactPerson.title}` : "";
    return `${intel.contactPerson.name}${title}`;
  }
  if (intel.instagram && intel.instagram.confidence === "verified") {
    return `DM ${intel.instagram.handle} on Instagram`;
  }
  if (intel.instagram && intel.instagram.confidence === "likely") {
    return `Instagram ${intel.instagram.handle} (verify before outreach)`;
  }
  if (intel.phone?.confidence !== "unavailable") {
    return `Call ${intel.phone.number}`;
  }
  if (intel.website?.confidence === "verified") {
    const host = intel.website.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/.*$/, "");
    return `Use the contact form at ${host}`;
  }
  return "Contact information unavailable — visit the official website directly.";
}

export function finalizeContactIntel(
  partial: Omit<PartnershipContactIntel, "outreachGuidance">
): PartnershipContactIntel {
  return {
    ...partial,
    emails: sortContactEmails(partial.emails),
    outreachGuidance: buildOutreachGuidance(partial),
  };
}

export function emptyContactIntel(): PartnershipContactIntel {
  return finalizeContactIntel({
    website: null,
    instagram: null,
    emails: [],
    contactPerson: null,
    phone: null,
  });
}

export function buildCuratedContactIntel(business: DirectoryBusiness): PartnershipContactIntel {
  const websiteUrl = normalizeWebsiteUrl(business.website);
  const instagram = business.instagram?.trim()
    ? business.instagram.trim().startsWith("@")
      ? business.instagram.trim()
      : `@${business.instagram.trim().replace(/^@/, "")}`
    : null;

  const emails: ContactEmailEntry[] = [];
  if (business.contactEmail) {
    emails.push({
      ...classifyEmail(business.contactEmail),
      confidence: "verified",
    });
  }

  const contactPerson = business.contactPerson
    ? {
        name: business.contactPerson,
        confidence: "verified" as ContactConfidence,
      }
    : null;

  return finalizeContactIntel({
    website: websiteUrl ? { url: websiteUrl, confidence: "verified" } : null,
    instagram: instagram ? { handle: instagram, confidence: "verified" } : null,
    emails,
    contactPerson,
    phone: null,
  });
}

export function buildDiscoveredContactIntel(input: {
  website?: string | null;
  phone?: string | null;
  instagram?: string | null;
  instagramSource?: "website" | "directory" | "geoapify" | "osm";
  emails?: ContactEmailEntry[];
  contactPerson?: PartnershipContactIntel["contactPerson"];
}): PartnershipContactIntel {
  const websiteUrl = normalizeWebsiteUrl(input.website);

  let instagram: PartnershipContactIntel["instagram"] = null;
  if (input.instagram) {
    const handle = input.instagram.startsWith("@") ? input.instagram : `@${input.instagram}`;
    const confidence: ContactConfidence =
      input.instagramSource === "website" || input.instagramSource === "directory"
        ? "verified"
        : "likely";
    instagram = { handle, confidence };
  }

  const phone =
    input.phone?.trim() ?
      { number: input.phone.trim(), confidence: "likely" as ContactConfidence }
    : null;

  return finalizeContactIntel({
    website: websiteUrl ? { url: websiteUrl, confidence: "likely" } : null,
    instagram,
    emails: input.emails ?? [],
    contactPerson: input.contactPerson ?? null,
    phone,
  });
}

export function contactIntelFromCachedPlace(place: CachedPartnershipPlace): PartnershipContactIntel | null {
  if (place.contact_intelligence && typeof place.contact_intelligence === "object") {
    return place.contact_intelligence;
  }
  return null;
}

export function applyContactIntelToOpportunityFields(intel: PartnershipContactIntel): {
  website: string;
  instagram: string;
  contactEmail: string | null;
  contactPerson: string | null;
  contactWhere: string;
} {
  const primaryEmail = sortContactEmails(intel.emails)[0]?.email ?? null;
  const contactPerson = intel.contactPerson
    ? intel.contactPerson.title
      ? `${intel.contactPerson.name} — ${intel.contactPerson.title}`
      : intel.contactPerson.name
    : null;

  return {
    website: intel.website?.url ?? "",
    instagram: intel.instagram?.handle ?? UNAVAILABLE_LABEL,
    contactEmail: primaryEmail,
    contactPerson,
    contactWhere: intel.outreachGuidance,
  };
}

export function isValidPublicWebsite(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  if (url.includes("google.com/search")) return false;
  if (url.includes("facebook.com/search")) return false;
  return Boolean(normalizeWebsiteUrl(url));
}

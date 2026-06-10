export type AutomatedTestMatchReason =
  | "email_domain"
  | "email_local_pattern"
  | "name_pattern"
  | "linked_test_purchase"
  | "linked_test_user";

const AUTOMATED_EMAIL_DOMAINS = new Set([
  "anyjazminmatos.com",
  "example.com",
  "test.com",
  "owner-live.ivarahous.com",
  "owner-verify.ivarahous.com",
]);

const AUTOMATED_LOCAL_PATTERNS = [
  /^e2e\+/,
  /^prod-e2e/,
  /^release-e2e/,
  /^verify$/,
  /^test\+/,
  /^crm-final-/,
  /^crm-verify-/,
  /^crm-live-/,
  /^owner-live-/,
  /^owner-verify-/,
  /^owner-final-/,
  /prod-e2e/,
  /release-e2e/,
  /crm-final-/,
  /crm-verify-/,
  /crm-live-/,
  /owner-live-/,
  /owner-verify-/,
  /owner-final-/,
];

const AUTOMATED_NAME_PATTERNS = [
  /^verify creator$/i,
  /^test creator$/i,
  /^e2e /i,
  /^prod-e2e/i,
  /^release-e2e/i,
  /^verify /i,
  /^crm final test/i,
  /^crm verify/i,
  /^crm live /i,
  /^owner live /i,
  /^owner verify /i,
  /^owner final /i,
  /^public api verify$/i,
];

export function isAutomatedTestEmail(email: string | null | undefined): boolean {
  if (!email) {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  const atIndex = normalized.lastIndexOf("@");
  if (atIndex <= 0) {
    return false;
  }

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  if (AUTOMATED_EMAIL_DOMAINS.has(domain)) {
    return true;
  }

  return AUTOMATED_LOCAL_PATTERNS.some((pattern) => pattern.test(local));
}

export function isAutomatedTestName(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }

  const normalized = name.trim();
  return AUTOMATED_NAME_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function isAutomatedTestAssessment(params: {
  email: string;
  fullName?: string | null;
}): boolean {
  return isAutomatedTestEmail(params.email) || isAutomatedTestName(params.fullName);
}

export type AdminDataScope = {
  includeTestData: boolean;
};

export function parseIncludeTestData(
  value: string | string[] | undefined
): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "true" || raw === "1";
}

export function withTestDataQuery(
  basePath: string,
  includeTestData: boolean,
  extraParams?: Record<string, string | undefined>
): string {
  const [path, existingQuery = ""] = basePath.split("?");
  const params = new URLSearchParams(existingQuery);

  if (includeTestData) {
    params.set("includeTestData", "true");
  } else {
    params.delete("includeTestData");
  }

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

const CREATOR_APPLICATION_WEBHOOK_URL =
  process.env.MAKE_CREATOR_APPLICATION_WEBHOOK_URL ??
  "https://hook.us2.make.com/pehrk94hogarbyjo9i9cslqbhec8pclx";

const CREATOR_APPLICATION_FIELDS = [
  "fullName",
  "email",
  "location",
  "instagram",
  "tiktok",
  "followerCount",
  "niche",
  "portfolio",
  "motivation",
  "experience",
  "contentSamples",
] as const;

export type CreatorApplicationPayload = Record<
  (typeof CREATOR_APPLICATION_FIELDS)[number],
  string
>;

export function pickCreatorApplicationFields(
  body: Record<string, unknown>
): CreatorApplicationPayload {
  const payload = {} as CreatorApplicationPayload;
  for (const key of CREATOR_APPLICATION_FIELDS) {
    const value = body[key];
    payload[key] = typeof value === "string" ? value : value != null ? String(value) : "";
  }
  return payload;
}

export async function sendCreatorApplicationToMake(
  body: Record<string, unknown>
): Promise<void> {
  const fields = pickCreatorApplicationFields(body);

  const response = await fetch(CREATOR_APPLICATION_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      formType: "creator-application",
      submittedAt: new Date().toISOString(),
      ...fields,
    }),
  });

  if (!response.ok) {
    throw new Error(`Make webhook failed with status ${response.status}`);
  }
}

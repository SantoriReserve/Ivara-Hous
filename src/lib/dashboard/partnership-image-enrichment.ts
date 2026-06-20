import { fetchWithTimeout } from "@/lib/dashboard/partnership-fetch-utils";

const OG_IMAGE_PATTERN =
  /<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["'][^>]+content=["']([^"']+)["']/i;
const OG_IMAGE_PATTERN_ALT =
  /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|twitter:image(?::src)?)["']/i;

function extractOgImage(html: string): string | null {
  const match = html.match(OG_IMAGE_PATTERN) ?? html.match(OG_IMAGE_PATTERN_ALT);
  if (!match?.[1]) return null;

  const url = match[1].trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;
  if (url.includes("logo") && url.includes("icon")) return null;
  return url;
}

export async function fetchOgImageUrl(website: string): Promise<string | null> {
  const normalized = website.startsWith("http") ? website : `https://${website}`;

  try {
    const res = await fetchWithTimeout(normalized, {
      timeoutMs: 2500,
      headers: {
        "User-Agent": "IvaraHous/1.0 (partnership-image-enrichment)",
        Accept: "text/html",
      },
      redirect: "follow",
    });
    if (!res.ok) return null;

    const html = await res.text();
    return extractOgImage(html.slice(0, 120_000));
  } catch {
    return null;
  }
}

export async function enrichImagesForWebsites(
  entries: Array<{ id: string; website: string | null; existingImageUrl?: string | null }>,
  maxConcurrent = 6
): Promise<Array<{ id: string; imageUrl: string; imageSource: string }>> {
  const pending = entries.filter(
    (entry) => entry.website && !entry.existingImageUrl?.trim()
  );
  if (pending.length === 0) return [];

  const results: Array<{ id: string; imageUrl: string; imageSource: string }> = [];

  for (let index = 0; index < pending.length; index += maxConcurrent) {
    const batch = pending.slice(index, index + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map(async (entry) => {
        const imageUrl = await fetchOgImageUrl(entry.website!);
        if (!imageUrl) return null;
        return { id: entry.id, imageUrl, imageSource: "website_og" };
      })
    );
    results.push(
      ...batchResults.filter(
        (item): item is { id: string; imageUrl: string; imageSource: string } => Boolean(item)
      )
    );
  }

  return results;
}

import type { ContentIdea } from "@/lib/dashboard/content-ideas";

export function pickDefaultContentIdea(ideas: ContentIdea[], dayNumber: number): ContentIdea | null {
  if (ideas.length === 0) return null;
  return ideas[dayNumber % ideas.length] ?? ideas[0];
}

export function pickSwapContentIdea(
  ideas: ContentIdea[],
  currentId: string,
  dayNumber: number
): ContentIdea | null {
  if (ideas.length === 0) return null;
  const others = ideas.filter((idea) => idea.id !== currentId);
  if (others.length === 0) return ideas[0];
  const index = (dayNumber + currentId.length) % others.length;
  return others[index] ?? others[0];
}

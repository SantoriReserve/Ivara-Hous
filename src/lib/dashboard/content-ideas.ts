import { fillContext } from "@/lib/dashboard/fill-context";
import { generateExpandedContentIdeas } from "@/lib/dashboard/content-ideas-expanded";
import {
  CONTENT_IDEA_FRAMEWORKS,
  type ContentIdeaFormat,
} from "@/lib/dashboard/content-ideas-library";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type ContentIdea = {
  id: string;
  title: string;
  format: ContentIdeaFormat;
  deliverable: string;
  description: string;
  hook: string;
  callToAction: string;
  shotList: string[];
  outreachUse: string;
  estimatedTime: string;
};

function stageMatches(ctx: CreatorContext, stages?: string[]): boolean {
  if (!stages?.length) return true;
  const s = ctx.stage.toLowerCase();
  return stages.some((st) => s.includes(st) || st.includes(s));
}

function nicheMatches(ctx: CreatorContext, niches?: string[]): boolean {
  if (!niches?.length) return true;
  const niche = ctx.niche.toLowerCase();
  return niches.some((n) => niche.includes(n) || n.includes(niche.split(" ")[0] ?? ""));
}

const ALL_CONTENT_FRAMEWORKS = (() => {
  const expanded = generateExpandedContentIdeas();
  const seen = new Set<string>();
  const merged = [...CONTENT_IDEA_FRAMEWORKS];
  for (const idea of expanded) {
    if (!seen.has(idea.id)) {
      seen.add(idea.id);
      merged.push(idea);
    }
  }
  return merged;
})();

export function getAllContentIdeaIds(): string[] {
  return ALL_CONTENT_FRAMEWORKS.map((idea) => idea.id);
}

export function getContentIdeas(ctx: CreatorContext): ContentIdea[] {
  return ALL_CONTENT_FRAMEWORKS.filter(
    (idea) => stageMatches(ctx, idea.stages) && nicheMatches(ctx, idea.niches)
  ).map((idea) => ({
    id: idea.id,
    title: fillContext(ctx, idea.title),
    format: idea.format,
    deliverable: fillContext(ctx, idea.deliverable),
    description: fillContext(ctx, idea.description),
    hook: fillContext(ctx, idea.hook),
    callToAction: fillContext(ctx, idea.callToAction),
    shotList: idea.shotList.map((step) => fillContext(ctx, step)),
    outreachUse: fillContext(ctx, idea.outreachUse),
    estimatedTime: idea.estimatedTime,
  }));
}

export function getContentIdeaById(ctx: CreatorContext, id: string): ContentIdea | null {
  return getContentIdeas(ctx).find((idea) => idea.id === id) ?? null;
}

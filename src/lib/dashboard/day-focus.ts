import { fillContext } from "@/lib/dashboard/fill-context";
import { pickDefaultContentIdea } from "@/lib/dashboard/content-daily";
import { getContentIdeaById, getContentIdeas } from "@/lib/dashboard/content-ideas";
import { getPitchTemplates } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";
import { ROUTES } from "@/lib/constants";

export type DayFocus = {
  mainObjective: string;
  contentAssignment: {
    title: string;
    description: string;
    href: string;
    ideaId?: string;
  };
  outreachAssignment: {
    title: string;
    description: string;
    href: string;
  };
  learningAssignment: {
    title: string;
    description: string;
    prompt: string;
    insightId: string;
  };
  reflectPrompt: string;
  resources: Array<{ label: string; href: string; description: string }>;
};

const STAGE_FOCUS: Record<string, Partial<DayFocus>> = {
  emerging: {
    mainObjective: "Build your first hospitality portfolio asset.",
    contentAssignment: {
      title: "Create a POV arrival reel",
      description: "Film a 20-second arrival sequence at a local property or café — your first proof post.",
      href: ROUTES.dashboardContentIdeas,
    },
    outreachAssignment: {
      title: "Send 3 boutique hotel DMs",
      description: "Use Partnership Opportunities and the Boutique Hotel Pitch — personalize every opening line.",
      href: ROUTES.dashboardPartnerships,
    },
    learningAssignment: {
      title: "Study one luxury travel creator",
      description: "Observe how they open reels, caption stays, and position partnerships.",
      prompt: "Write 3 things they do well that you can apply to your {niche} content this week.",
      insightId: "study-luxury-creator",
    },
    reflectPrompt: "What felt hardest today — filming, writing, or sending the first message?",
  },
  growing: {
    mainObjective: "Turn content proof into outreach momentum.",
    contentAssignment: {
      title: "Publish one carousel case study",
      description: "Document a recent stay or dining feature with metrics — attach to pitches this week.",
      href: ROUTES.dashboardContentIdeas,
    },
    outreachAssignment: {
      title: "Send 5 personalized pitches",
      description: "Mix boutique hotels and restaurants — log every send in your outreach tracker.",
      href: ROUTES.dashboardPartnerships,
    },
    learningAssignment: {
      title: "Review a hotel campaign",
      description: "Study how a property sequences content across feed, stories, and partnerships.",
      prompt: "What hook, format, and CTA would you adapt for {dream} brands?",
      insightId: "study-hotel-campaign",
    },
    reflectPrompt: "Which pitch got the best response signal — and what did you do differently?",
  },
  established: {
    mainObjective: "Upgrade partnership quality and paid deliverables.",
    contentAssignment: {
      title: "Ship one UGC or paid-ready asset",
      description: "Create platform-ready vertical clips a brand can run without a public post.",
      href: ROUTES.dashboardContentIdeas,
    },
    outreachAssignment: {
      title: "Pitch 2 stretch targets + 2 follow-ups",
      description: "Balance dream brands with confident follow-ups on warm leads.",
      href: ROUTES.dashboardPartnerships,
    },
    learningAssignment: {
      title: "Analyze a hospitality brand page",
      description: "Study positioning, visual language, and partnership cues on their Instagram.",
      prompt: "How would you position your {positioning} to match their guest profile?",
      insightId: "study-brand-page",
    },
    reflectPrompt: "What partnership tier are you ready for now — hosted, UGC, or paid campaign?",
  },
};

function stageKey(stage: string): string {
  const s = stage.toLowerCase();
  if (s.includes("established")) return "established";
  if (s.includes("growing")) return "growing";
  return "emerging";
}

function dayPhase(dayNumber: number): "foundation" | "content" | "outreach" | "scale" {
  if (dayNumber <= 7) return "foundation";
  if (dayNumber <= 14) return "content";
  if (dayNumber <= 28) return "outreach";
  return "scale";
}

export function getDayFocus(
  ctx: CreatorContext,
  dayNumber: number,
  options?: { pinnedIdeaId?: string | null }
): DayFocus {
  const stage = stageKey(ctx.stage);
  const phase = dayPhase(dayNumber);
  const base = STAGE_FOCUS[stage] ?? STAGE_FOCUS.emerging;
  const ideas = getContentIdeas(ctx);
  const pitches = getPitchTemplates(ctx);
  const pinnedIdea = options?.pinnedIdeaId
    ? getContentIdeaById(ctx, options.pinnedIdeaId)
    : null;
  const contentPick = pinnedIdea ?? pickDefaultContentIdea(ideas, dayNumber);
  const pitchPick =
    pitches.find((p) => p.id === "boutique-hotel") ??
    pitches.find((p) => p.id === "hosted-stay") ??
    pitches[0];

  const phaseOverrides: Partial<DayFocus> =
    phase === "foundation"
      ? {
          mainObjective: fillContext(
            ctx,
            "Set up your creator operating system — media kit, grid, and positioning for {tier} partnerships."
          ),
          outreachAssignment: {
            title: "Research 5 targets in Partnership Opportunities",
            description: "Save contacts and note one personalization angle per property — no sends required yet.",
            href: ROUTES.dashboardPartnerships,
          },
        }
      : phase === "content"
        ? {
            mainObjective: fillContext(
              ctx,
              "Publish proof content that shows {dream} brands what you deliver."
            ),
            contentAssignment:
              contentPick && base.contentAssignment
                ? {
                    title: contentPick.title,
                    description: contentPick.deliverable,
                    href: `${ROUTES.dashboardContentIdeas}#${contentPick.id}`,
                    ideaId: contentPick.id,
                  }
                : base.contentAssignment!,
          }
        : phase === "outreach"
          ? {
              mainObjective: fillContext(
                ctx,
                "Execute outreach — every personalized pitch moves you toward {goal}."
              ),
              outreachAssignment: {
                title: `Send ${stage === "emerging" ? "3" : "5"} pitches using ${pitchPick?.title ?? "Pitch Templates"}`,
                description: pitchPick?.sendToday ?? "Personalize every opening line before sending.",
                href: `${ROUTES.dashboardPitchTemplates}#${pitchPick?.id ?? "hosted-stay"}`,
              },
            }
          : {
              mainObjective: fillContext(
                ctx,
                "Scale — follow-ups, paid UGC offers, and stretch partnerships toward {dream}."
              ),
            };

  const merged: DayFocus = {
    mainObjective: fillContext(ctx, base.mainObjective ?? "Execute today's partnership actions."),
    contentAssignment: base.contentAssignment!,
    outreachAssignment: base.outreachAssignment!,
    learningAssignment: {
      title: base.learningAssignment!.title,
      description: base.learningAssignment!.description,
      prompt: fillContext(ctx, base.learningAssignment!.prompt),
      insightId: base.learningAssignment!.insightId,
    },
    reflectPrompt: fillContext(ctx, base.reflectPrompt ?? "What moved you closer to a partnership today?"),
    resources: [
      {
        label: "Pitch Templates",
        href: ROUTES.dashboardPitchTemplates,
        description: "Copy-ready outreach for hotels, restaurants, villas, and UGC.",
      },
      {
        label: "Partnership Opportunities",
        href: ROUTES.dashboardPartnerships,
        description: "Curated targets plus location search for new outreach.",
      },
      {
        label: "Content Ideas",
        href: ROUTES.dashboardContentIdeas,
        description: "Shot lists, hooks, and outreach use cases for every format.",
      },
      {
        label: "Resources",
        href: ROUTES.dashboardResources,
        description: "Media kit, outreach tracker, and rate card guidance.",
      },
    ],
    ...phaseOverrides,
  };

  if (phaseOverrides.contentAssignment) {
    merged.contentAssignment = phaseOverrides.contentAssignment;
  }
  if (phaseOverrides.outreachAssignment) {
    merged.outreachAssignment = phaseOverrides.outreachAssignment;
  }
  if (phaseOverrides.mainObjective) {
    merged.mainObjective = phaseOverrides.mainObjective;
  }

  return merged;
}

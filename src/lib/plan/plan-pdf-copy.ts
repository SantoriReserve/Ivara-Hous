import type { AssessmentRecord } from "@/lib/assessment-schema";
import type { FocusArea } from "@/lib/plan/plan-constants";
import type { PlanGraph } from "@/lib/plan/plan-schema";

const INVALID_TOKENS = new Set([
  "null",
  "undefined",
  "none",
  "n/a",
  "na",
  "tbd",
  "unknown",
  "not provided",
  "not specified",
]);

const GENERATOR_ARTIFACTS = [
  /gen-[\w.]+/gi,
  /\{[a-z0-9_]+\}/gi,
  /template engine/gi,
  /openai/gi,
];

const ROADMAP_WEEKS = [
  { week: 1, label: "Foundation", theme: "Portfolio, positioning, and media kit" },
  { week: 2, label: "Content Engine", theme: "Publish proof content brands can repost" },
  { week: 3, label: "Outreach", theme: "Personalized pitches and follow-ups" },
  { week: 4, label: "Partnerships", theme: "UGC, resort, and villa proposals" },
  { week: 5, label: "Brand Expansion", theme: "Audience growth and media kit polish" },
  { week: 6, label: "Scale", theme: "Pipeline, proposals, and next 30 days" },
] as const;

const FOCUS_RESOURCES: Record<FocusArea, string[]> = {
  portfolio: ["Media Kit Guidance", "Content Ideas — portfolio proof assignments"],
  content: ["Content Ideas library", "Shot lists, hooks, and outreach use cases"],
  positioning: ["Pitch Templates", "Your positioning statement from assessment"],
  outreach: ["Partnership Opportunities", "Pitch Templates", "Outreach Tracker"],
  partnerships: ["Pitch Templates", "Partnership Opportunities", "Rate Card Guidance"],
  brand: ["Media Kit Guidance", "Grid and bio optimization"],
  audience: ["Content Ideas", "Brand engagement sprint"],
  skills: ["Resources library", "Today — Industry Insight prompts"],
};

export type PdfScorecard = {
  label: string;
  score: number;
  explanation: string;
};

export type PdfRoadmapWeek = {
  weekNumber: number;
  label: string;
  title: string;
  milestone: string;
  successCriteria: string;
  dayRange: string;
  theme: string;
};

function buildSubtitleFallback(archetype: string): string {
  const clean = archetype.trim();
  if (!clean) return "A personalized partnership operating system built for your goals.";
  if (/\bcreators?\b/i.test(clean)) {
    return `A personalized partnership operating system for ${clean}.`;
  }
  return `A personalized partnership operating system for ${clean} creators.`;
}

export type PdfDayContent = {
  dayNumber: number;
  weekNumber: number;
  title: string;
  objective: string;
  focusArea: string;
  estimatedMinutes: number;
  successCriteria: string[];
  resources: string[];
  tasks: Array<{
    order: number;
    type: string;
    title: string;
    instruction: string;
    deliverable: string;
    successCriteria: string;
    required: boolean;
  }>;
};

export type PreparedPdfContent = {
  fullName: string;
  generatedDate: string;
  primaryGoal: string;
  creatorStage: string;
  creatorArchetype: string;
  idealPartnershipTier: string;
  subtitle: string;
  assessmentOverview: string;
  positioningStatement: string;
  nicheAlignment: string;
  audienceProfile: string;
  strengths: string[];
  growthOpportunities: string[];
  recommendedNextStep: string;
  focusAreas: string[];
  developmentPriorities: string[];
  scorecards: PdfScorecard[];
  roadmap: PdfRoadmapWeek[];
  days: PdfDayContent[];
};

function isInvalidValue(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return true;
  if (INVALID_TOKENS.has(trimmed)) return true;
  if (/^any\s+/i.test(trimmed) && INVALID_TOKENS.has(trimmed.replace(/^any\s+/, ""))) return true;
  return false;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function dedupeWords(text: string): string {
  return text.replace(/\b(\w+)(?:\s+\1\b)+/gi, "$1");
}

function cleanUrls(text: string): string {
  return text.replace(
    /(https?:\/\/[^\s]+)/g,
    (url) => url.replace(/[),.]+$/, (m) => (m === ")" ? ")" : ""))
  );
}

export function sanitizePdfText(
  raw: string,
  fallback = "your hospitality partnership goals"
): string {
  if (!raw || typeof raw !== "string") return fallback;

  let text = raw
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  for (const pattern of GENERATOR_ARTIFACTS) {
    text = text.replace(pattern, "");
  }

  text = text
    .replace(/\bfocused on none\b/gi, "focused on partnership-ready storytelling")
    .replace(/\bfor none\b/gi, "for hospitality brands")
    .replace(/\bwith none\b/gi, "with elevated travel experiences")
    .replace(/\bany luxury stays\b/gi, "luxury hospitality stays")
    .replace(/\bany\s+none\b/gi, "target hospitality brands")
    .replace(/\bnone\s+partnerships\b/gi, "hospitality partnerships")
    .replace(/\bcreator creators\b/gi, "creators")
    .replace(/\bCreators creators\b/gi, "creators")
    .replace(/\b(\w+)\s+\1\b/gi, "$1");

  text = dedupeWords(text);

  if (isInvalidValue(text)) return fallback;

  const words = text.split(" ");
  const cleanedWords = words.filter((word, index) => {
    const lower = word.toLowerCase().replace(/[^a-z]/g, "");
    if (index > 0 && lower === words[index - 1]?.toLowerCase().replace(/[^a-z]/g, "")) {
      return false;
    }
    return !INVALID_TOKENS.has(lower);
  });

  text = cleanUrls(cleanedWords.join(" ").trim());

  if (!text || isInvalidValue(text)) return fallback;

  if (!/[.!?]$/.test(text) && text.length > 120) {
    text = `${text}.`;
  }

  return text;
}

function sanitizeList(items: string[], fallback: string[]): string[] {
  const cleaned = items
    .map((item) => sanitizePdfText(item))
    .filter((item) => item.length > 2);
  const unique = [...new Set(cleaned)];
  return unique.length > 0 ? unique : fallback;
}

function formatFocusArea(area: string): string {
  return sanitizePdfText(titleCase(area.replace(/_/g, " ")), "Partnership development");
}

function resourcesForFocus(focusArea: FocusArea): string[] {
  return FOCUS_RESOURCES[focusArea].map((r) => sanitizePdfText(r));
}

export function preparePdfContent(
  graph: PlanGraph,
  assessment: AssessmentRecord,
  fullName: string
): PreparedPdfContent {
  const { analysis } = assessment;
  const { preview, foundation, scores, scoreExplanations } = analysis;
  const summary = graph.instance.planSummary;

  const safeName = sanitizePdfText(fullName, "Creator");
  const primaryGoal = sanitizePdfText(summary.primaryGoal, "Land your first hospitality partnership");
  const creatorStage = sanitizePdfText(summary.creatorStage, preview.currentCreatorStage);
  const creatorArchetype = sanitizePdfText(summary.creatorArchetype, preview.creatorArchetype);
  const idealTier = sanitizePdfText(
    summary.idealPartnershipTier,
    preview.idealPartnershipTier
  );

  const scorecards: PdfScorecard[] = [
    {
      label: "Creator Readiness",
      score: scores.creatorReadiness,
      explanation: sanitizePdfText(scoreExplanations.creatorReadiness),
    },
    {
      label: "Portfolio Strength",
      score: scores.portfolioStrength,
      explanation: sanitizePdfText(scoreExplanations.portfolioStrength),
    },
    {
      label: "Content Quality",
      score: scores.contentQuality,
      explanation: sanitizePdfText(scoreExplanations.contentQuality),
    },
    {
      label: "Partnership Potential",
      score: scores.partnershipPotential,
      explanation: sanitizePdfText(scoreExplanations.partnershipPotential),
    },
    {
      label: "Luxury Alignment",
      score: scores.luxuryTravelAlignment,
      explanation: sanitizePdfText(scoreExplanations.luxuryTravelAlignment),
    },
  ];

  const roadmap: PdfRoadmapWeek[] = graph.weeks.map((week) => {
    const meta = ROADMAP_WEEKS.find((w) => w.week === week.weekNumber);
    return {
      weekNumber: week.weekNumber,
      label: meta?.label ?? `Week ${week.weekNumber}`,
      title: sanitizePdfText(week.title),
      milestone: sanitizePdfText(week.milestone),
      successCriteria: sanitizePdfText(week.successCriteria),
      dayRange: `Days ${week.startDay}–${week.endDay}`,
      theme: meta?.theme ?? sanitizePdfText(week.milestone),
    };
  });

  const tasksByDayId = new Map<string, typeof graph.tasks>();
  for (const task of graph.tasks) {
    const list = tasksByDayId.get(task.planDayId) ?? [];
    list.push(task);
    tasksByDayId.set(task.planDayId, list);
  }

  const days: PdfDayContent[] = [...graph.days]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((day) => ({
      dayNumber: day.dayNumber,
      weekNumber: day.weekNumber,
      title: sanitizePdfText(day.title),
      objective: sanitizePdfText(day.objective),
      focusArea: formatFocusArea(day.focusArea),
      estimatedMinutes: day.estimatedMinutes,
      resources: resourcesForFocus(day.focusArea as FocusArea),
      successCriteria: sanitizeList(
        (tasksByDayId.get(day.id) ?? [])
          .filter((task) => task.isRequired)
          .sort((a, b) => a.taskOrder - b.taskOrder)
          .map((task) => task.successCriteria),
        ["Complete all required tasks with clear deliverables."]
      ),
      tasks: (tasksByDayId.get(day.id) ?? [])
        .sort((a, b) => a.taskOrder - b.taskOrder)
        .map((task) => ({
          order: task.taskOrder,
          type: sanitizePdfText(titleCase(task.taskType)),
          title: sanitizePdfText(task.title),
          instruction: sanitizePdfText(task.instruction),
          deliverable: sanitizePdfText(task.deliverable),
          successCriteria: sanitizePdfText(task.successCriteria),
          required: task.isRequired,
        })),
    }));

  const content: PreparedPdfContent = {
    fullName: safeName,
    generatedDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    primaryGoal,
    creatorStage,
    creatorArchetype,
    idealPartnershipTier: idealTier,
    subtitle: sanitizePdfText(summary.subtitle, buildSubtitleFallback(creatorArchetype)),
    assessmentOverview: sanitizePdfText(foundation.creatorProfileSummary),
    positioningStatement: sanitizePdfText(foundation.positioningStatement),
    nicheAlignment: sanitizePdfText(foundation.nicheAlignment),
    audienceProfile: sanitizePdfText(foundation.audienceProfile),
    strengths: sanitizeList(preview.topStrengths, [
      "Visual storytelling",
      "Niche clarity",
      "Audience engagement",
    ]),
    growthOpportunities: sanitizeList(preview.growthOpportunities, [
      "Outreach consistency",
      "Partnership proof",
      "Media kit development",
    ]),
    recommendedNextStep: sanitizePdfText(preview.recommendedNextStep),
    focusAreas: sanitizeList(
      preview.priorityFocusAreas.map((a) => titleCase(a)),
      ["Portfolio", "Outreach", "Content"]
    ),
    developmentPriorities: sanitizeList(
      foundation.developmentPriorities.map(
        (item) => `${titleCase(item.area)} (${item.priority} priority): ${item.rationale}`
      ),
      []
    ),
    scorecards,
    roadmap,
    days,
  };

  validatePdfContent(content);
  return content;
}

export function validatePdfContent(content: PreparedPdfContent): void {
  const forbidden = [
    "null",
    "undefined",
    "{",
    "}",
    "focused on none",
    "creator creators",
    "any luxury stays",
    "gen-3",
  ];

  const collect = (value: string) => {
    const lower = value.toLowerCase();
    for (const phrase of forbidden) {
      if (lower.includes(phrase)) {
        throw new Error(`PDF copy validation failed: found "${phrase}" in "${value.slice(0, 80)}"`);
      }
    }
  };

  const walk = (value: unknown): void => {
    if (typeof value === "string") collect(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === "object") Object.values(value).forEach(walk);
  };

  walk(content);
}

export const PLAN_PDF_FILENAME = "Ivara-Hous-40-Day-Creator-Development-Plan.pdf";

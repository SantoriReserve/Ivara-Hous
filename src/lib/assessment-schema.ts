import { z } from "zod";
import type { AssessmentAnswers } from "@/lib/assessment";

export const ASSESSMENT_SCHEMA_VERSION = "1.0.0" as const;

export type AssessmentSchemaVersion = typeof ASSESSMENT_SCHEMA_VERSION;

const readinessLevelSchema = z.enum(["low", "moderate", "high"]);

export const assessmentScoresSchema = z.object({
  creatorReadiness: z.number().int().min(0).max(100),
  portfolioStrength: z.number().int().min(0).max(100),
  contentQuality: z.number().int().min(0).max(100),
  partnershipPotential: z.number().int().min(0).max(100),
  luxuryTravelAlignment: z.number().int().min(0).max(100),
});

export const scoreExplanationsSchema = z.object({
  creatorReadiness: z.string().min(1),
  portfolioStrength: z.string().min(1),
  contentQuality: z.string().min(1),
  partnershipPotential: z.string().min(1),
  luxuryTravelAlignment: z.string().min(1),
});

export const assessmentPreviewSchema = z.object({
  currentCreatorStage: z.string().min(1),
  creatorArchetype: z.string().min(1),
  idealPartnershipTier: z.string().min(1),
  topStrengths: z.array(z.string().min(1)).length(3),
  growthOpportunities: z.array(z.string().min(1)).length(3),
  estimatedTimelineToFirstCollaboration: z.string().min(1),
  recommendedNextStep: z.string().min(1),
  priorityFocusAreas: z.array(z.string().min(1)).min(3).max(5),
});

export const developmentFoundationSchema = z.object({
  creatorStage: z.string().min(1),
  creatorArchetype: z.string().min(1),
  idealPartnershipTier: z.string().min(1),
  priorityFocusAreas: z.array(z.string().min(1)).min(3).max(5),
  portfolioDevelopmentPriority: z.string().min(1),
  outreachReadiness: readinessLevelSchema,
  contentConsistencyLevel: readinessLevelSchema,
  hospitalityExperienceLevel: readinessLevelSchema,
  estimatedCollaborationTimeline: z.string().min(1),
});

const developmentPrioritySchema = z.object({
  area: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  rationale: z.string().min(1),
});

const milestoneSchema = z.object({
  milestone: z.string().min(1),
  targetWindow: z.string().min(1),
});

export const assessmentFoundationSchema = z.object({
  creatorProfileSummary: z.string().min(1),
  positioningStatement: z.string().min(1),
  nicheAlignment: z.string().min(1),
  audienceProfile: z.string().min(1),
  contentPillars: z.array(z.string().min(1)).min(3).max(5),
  portfolioGaps: z.array(z.string().min(1)).min(2).max(5),
  planGenerationSeed: z.object({
    primaryGoal: z.string().min(1),
    secondaryGoals: z.array(z.string().min(1)).min(1).max(4),
    constraints: z.array(z.string().min(1)).min(1).max(6),
    recommendedPlanFocus: z.array(z.string().min(1)).min(2).max(4),
    suggestedMilestones: z.array(milestoneSchema).min(2).max(5),
  }),
  developmentPriorities: z.array(developmentPrioritySchema).min(2).max(5),
});

const nullableExtension = z.null();

export const assessmentExtensionsSchema = z.object({
  contentStrategy: nullableExtension,
  portfolioDevelopmentPlan: nullableExtension,
  hotelOutreachRecommendations: nullableExtension,
  fortyDayPlan: nullableExtension,
  dailyActionPlan: nullableExtension,
  contentCalendar: nullableExtension,
  dashboardProgress: nullableExtension,
});

export const assessmentAnalysisSchema = z.object({
  schemaVersion: z.literal(ASSESSMENT_SCHEMA_VERSION),
  scores: assessmentScoresSchema,
  scoreExplanations: scoreExplanationsSchema,
  preview: assessmentPreviewSchema,
  developmentFoundation: developmentFoundationSchema,
  foundation: assessmentFoundationSchema,
  extensions: assessmentExtensionsSchema,
});

export type AssessmentScores = z.infer<typeof assessmentScoresSchema>;
export type ScoreExplanations = z.infer<typeof scoreExplanationsSchema>;
export type AssessmentPreview = z.infer<typeof assessmentPreviewSchema>;
export type DevelopmentFoundation = z.infer<typeof developmentFoundationSchema>;
export type AssessmentFoundation = z.infer<typeof assessmentFoundationSchema>;
export type AssessmentExtensions = z.infer<typeof assessmentExtensionsSchema>;
export type AssessmentAnalysis = z.infer<typeof assessmentAnalysisSchema>;

export type AssessmentSubmission = {
  assessmentId: string;
  submittedAt: string;
  schemaVersion: AssessmentSchemaVersion;
  answers: AssessmentAnswers;
  source: "creator-development-assessment";
};

export type AssessmentRecord = AssessmentSubmission & {
  analysis: AssessmentAnalysis;
  paymentStatus: "free" | "paid";
};

/** Client-facing API payload (includes full analysis for future dashboard hydration). */
export type AssessmentResult = AssessmentSubmission & {
  analysis: AssessmentAnalysis;
};

export const assessmentAnswersSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  location: z.string().min(1),
  instagram: z.string().optional().default(""),
  tiktok: z.string().optional().default(""),
  niche: z.string().min(1),
  followerCount: z.string().min(1),
  portfolioLink: z.string().optional().default(""),
  travelExperience: z.string().min(1),
  contentStyle: z.string().min(1),
  goals: z.string().min(1),
  dreamPartnerships: z.string().min(1),
  biggestChallenge: z.string().min(1),
  upcomingTravel: z.string().optional().default(""),
  budgetResources: z.string().optional().default(""),
  equipment: z.string().optional().default(""),
  desiredOutcome: z.string().min(1),
});

export function deriveCollaborationTimeline(scores: AssessmentScores): string {
  const profileStrength =
    (scores.creatorReadiness +
      scores.portfolioStrength +
      scores.partnershipPotential +
      scores.contentQuality) /
    4;

  if (profileStrength >= 75) {
    return "30–60 days";
  }
  if (profileStrength >= 55) {
    return "60–90 days";
  }
  return "90–180 days";
}

type LegacyAssessmentPreview = AssessmentPreview & {
  estimatedTimelineToFirstHostedStay?: string;
};

export function getCollaborationTimeline(
  preview: LegacyAssessmentPreview,
  scores: AssessmentScores
): string {
  if (preview.estimatedTimelineToFirstCollaboration) {
    return preview.estimatedTimelineToFirstCollaboration;
  }
  if (preview.estimatedTimelineToFirstHostedStay) {
    return preview.estimatedTimelineToFirstHostedStay;
  }
  return deriveCollaborationTimeline(scores);
}

export function clampScores(scores: AssessmentScores): AssessmentScores {
  const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
  return {
    creatorReadiness: clamp(scores.creatorReadiness),
    portfolioStrength: clamp(scores.portfolioStrength),
    contentQuality: clamp(scores.contentQuality),
    partnershipPotential: clamp(scores.partnershipPotential),
    luxuryTravelAlignment: clamp(scores.luxuryTravelAlignment),
  };
}

/** OpenAI strict JSON schema for structured outputs. */
export const OPENAI_ASSESSMENT_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "scores",
    "scoreExplanations",
    "preview",
    "developmentFoundation",
    "foundation",
    "extensions",
  ],
  properties: {
    schemaVersion: { type: "string", enum: [ASSESSMENT_SCHEMA_VERSION] },
    scores: {
      type: "object",
      additionalProperties: false,
      required: [
        "creatorReadiness",
        "portfolioStrength",
        "contentQuality",
        "partnershipPotential",
        "luxuryTravelAlignment",
      ],
      properties: {
        creatorReadiness: { type: "integer", minimum: 0, maximum: 100 },
        portfolioStrength: { type: "integer", minimum: 0, maximum: 100 },
        contentQuality: { type: "integer", minimum: 0, maximum: 100 },
        partnershipPotential: { type: "integer", minimum: 0, maximum: 100 },
        luxuryTravelAlignment: { type: "integer", minimum: 0, maximum: 100 },
      },
    },
    scoreExplanations: {
      type: "object",
      additionalProperties: false,
      required: [
        "creatorReadiness",
        "portfolioStrength",
        "contentQuality",
        "partnershipPotential",
        "luxuryTravelAlignment",
      ],
      properties: {
        creatorReadiness: { type: "string" },
        portfolioStrength: { type: "string" },
        contentQuality: { type: "string" },
        partnershipPotential: { type: "string" },
        luxuryTravelAlignment: { type: "string" },
      },
    },
    preview: {
      type: "object",
      additionalProperties: false,
      required: [
        "currentCreatorStage",
        "creatorArchetype",
        "idealPartnershipTier",
        "topStrengths",
        "growthOpportunities",
        "estimatedTimelineToFirstCollaboration",
        "recommendedNextStep",
        "priorityFocusAreas",
      ],
      properties: {
        currentCreatorStage: { type: "string" },
        creatorArchetype: { type: "string" },
        idealPartnershipTier: { type: "string" },
        topStrengths: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3,
        },
        growthOpportunities: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3,
        },
        estimatedTimelineToFirstCollaboration: { type: "string" },
        recommendedNextStep: { type: "string" },
        priorityFocusAreas: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
      },
    },
    developmentFoundation: {
      type: "object",
      additionalProperties: false,
      required: [
        "creatorStage",
        "creatorArchetype",
        "idealPartnershipTier",
        "priorityFocusAreas",
        "portfolioDevelopmentPriority",
        "outreachReadiness",
        "contentConsistencyLevel",
        "hospitalityExperienceLevel",
        "estimatedCollaborationTimeline",
      ],
      properties: {
        creatorStage: { type: "string" },
        creatorArchetype: { type: "string" },
        idealPartnershipTier: { type: "string" },
        priorityFocusAreas: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
        portfolioDevelopmentPriority: { type: "string" },
        outreachReadiness: { type: "string", enum: ["low", "moderate", "high"] },
        contentConsistencyLevel: { type: "string", enum: ["low", "moderate", "high"] },
        hospitalityExperienceLevel: { type: "string", enum: ["low", "moderate", "high"] },
        estimatedCollaborationTimeline: { type: "string" },
      },
    },
    foundation: {
      type: "object",
      additionalProperties: false,
      required: [
        "creatorProfileSummary",
        "positioningStatement",
        "nicheAlignment",
        "audienceProfile",
        "contentPillars",
        "portfolioGaps",
        "planGenerationSeed",
        "developmentPriorities",
      ],
      properties: {
        creatorProfileSummary: { type: "string" },
        positioningStatement: { type: "string" },
        nicheAlignment: { type: "string" },
        audienceProfile: { type: "string" },
        contentPillars: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 5,
        },
        portfolioGaps: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 5,
        },
        planGenerationSeed: {
          type: "object",
          additionalProperties: false,
          required: [
            "primaryGoal",
            "secondaryGoals",
            "constraints",
            "recommendedPlanFocus",
            "suggestedMilestones",
          ],
          properties: {
            primaryGoal: { type: "string" },
            secondaryGoals: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 4,
            },
            constraints: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 6,
            },
            recommendedPlanFocus: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4,
            },
            suggestedMilestones: {
              type: "array",
              minItems: 2,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["milestone", "targetWindow"],
                properties: {
                  milestone: { type: "string" },
                  targetWindow: { type: "string" },
                },
              },
            },
          },
        },
        developmentPriorities: {
          type: "array",
          minItems: 2,
          maxItems: 5,
          items: {
            type: "object",
            additionalProperties: false,
            required: ["area", "priority", "rationale"],
            properties: {
              area: { type: "string" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              rationale: { type: "string" },
            },
          },
        },
      },
    },
    extensions: {
      type: "object",
      additionalProperties: false,
      required: [
        "contentStrategy",
        "portfolioDevelopmentPlan",
        "hotelOutreachRecommendations",
        "fortyDayPlan",
        "dailyActionPlan",
        "contentCalendar",
        "dashboardProgress",
      ],
      properties: {
        contentStrategy: { type: "null" },
        portfolioDevelopmentPlan: { type: "null" },
        hotelOutreachRecommendations: { type: "null" },
        fortyDayPlan: { type: "null" },
        dailyActionPlan: { type: "null" },
        contentCalendar: { type: "null" },
        dashboardProgress: { type: "null" },
      },
    },
  },
} as const;

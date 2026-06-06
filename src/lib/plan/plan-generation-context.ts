import type { AssessmentAnswers, AssessmentAnalysis, AssessmentScores } from "@/lib/assessment";
import type { AssessmentRecord } from "@/lib/assessment-schema";

export type CreatorContext = {
  fullName: string;
  email: string;
  location: string;
  instagram: string;
  tiktok: string;
  niche: string;
  followerCount: string;
  portfolioLink: string;
  travelExperience: string;
  contentStyle: string;
  goals: string;
  dreamPartnerships: string;
  biggestChallenge: string;
  upcomingTravel: string;
  budgetResources: string;
  equipment: string;
  desiredOutcome: string;
  stage: string;
  archetype: string;
  tier: string;
  priorityFocusAreas: string[];
  primaryGoal: string;
  secondaryGoals: string[];
  constraints: string[];
  portfolioGaps: string[];
  contentPillars: string[];
  outreachReadiness: string;
  contentConsistencyLevel: string;
  hospitalityExperienceLevel: string;
  portfolioDevelopmentPriority: string;
  positioningStatement: string;
  creatorProfileSummary: string;
  scores: AssessmentScores;
  developmentPriorities: AssessmentAnalysis["foundation"]["developmentPriorities"];
  suggestedMilestones: AssessmentAnalysis["foundation"]["planGenerationSeed"]["suggestedMilestones"];
};

export function extractCreatorContext(assessment: AssessmentRecord): CreatorContext {
  const { answers, analysis } = assessment;
  const { developmentFoundation, foundation } = analysis;

  return {
    fullName: answers.fullName,
    email: answers.email,
    location: answers.location,
    instagram: answers.instagram,
    tiktok: answers.tiktok,
    niche: answers.niche,
    followerCount: answers.followerCount,
    portfolioLink: answers.portfolioLink,
    travelExperience: answers.travelExperience,
    contentStyle: answers.contentStyle,
    goals: answers.goals,
    dreamPartnerships: answers.dreamPartnerships,
    biggestChallenge: answers.biggestChallenge,
    upcomingTravel: answers.upcomingTravel,
    budgetResources: answers.budgetResources,
    equipment: answers.equipment,
    desiredOutcome: answers.desiredOutcome,
    stage: developmentFoundation.creatorStage,
    archetype: developmentFoundation.creatorArchetype,
    tier: developmentFoundation.idealPartnershipTier,
    priorityFocusAreas: developmentFoundation.priorityFocusAreas,
    primaryGoal: foundation.planGenerationSeed.primaryGoal,
    secondaryGoals: foundation.planGenerationSeed.secondaryGoals,
    constraints: foundation.planGenerationSeed.constraints,
    portfolioGaps: foundation.portfolioGaps,
    contentPillars: foundation.contentPillars,
    outreachReadiness: developmentFoundation.outreachReadiness,
    contentConsistencyLevel: developmentFoundation.contentConsistencyLevel,
    hospitalityExperienceLevel: developmentFoundation.hospitalityExperienceLevel,
    portfolioDevelopmentPriority: developmentFoundation.portfolioDevelopmentPriority,
    positioningStatement: foundation.positioningStatement,
    creatorProfileSummary: foundation.creatorProfileSummary,
    scores: analysis.scores,
    developmentPriorities: foundation.developmentPriorities,
    suggestedMilestones: foundation.planGenerationSeed.suggestedMilestones,
  };
}

export function formatCreatorContextForPrompt(context: CreatorContext): string {
  return `CREATOR PROFILE:
Name: ${context.fullName}
Location: ${context.location}
Niche: ${context.niche}
Instagram: ${context.instagram || "(not provided)"}
TikTok: ${context.tiktok || "(not provided)"}
Follower Count: ${context.followerCount}
Portfolio Link: ${context.portfolioLink || "(not provided)"}

CREATOR STAGE & POSITIONING:
Stage: ${context.stage}
Archetype: ${context.archetype}
Ideal Partnership Tier: ${context.tier}
Positioning: ${context.positioningStatement}
Profile Summary: ${context.creatorProfileSummary}

GOALS & CHALLENGES:
Primary Goal: ${context.primaryGoal}
Secondary Goals: ${context.secondaryGoals.join("; ")}
Stated Goals: ${context.goals}
Dream Partnerships: ${context.dreamPartnerships}
Biggest Challenge: ${context.biggestChallenge}
Desired Outcome: ${context.desiredOutcome}

TRAVEL & CONTENT:
Travel Experience: ${context.travelExperience}
Content Style: ${context.contentStyle}
Content Pillars: ${context.contentPillars.join("; ")}
Upcoming Travel: ${context.upcomingTravel || "(not provided)"}
Equipment: ${context.equipment || "(not provided)"}
Budget/Resources: ${context.budgetResources || "(not provided)"}

DEVELOPMENT SIGNALS:
Priority Focus Areas: ${context.priorityFocusAreas.join("; ")}
Portfolio Gaps: ${context.portfolioGaps.join("; ")}
Portfolio Development Priority: ${context.portfolioDevelopmentPriority}
Outreach Readiness: ${context.outreachReadiness}
Content Consistency: ${context.contentConsistencyLevel}
Hospitality Experience: ${context.hospitalityExperienceLevel}
Constraints: ${context.constraints.join("; ")}

SCORES (0-100):
Creator Readiness: ${context.scores.creatorReadiness}
Portfolio Strength: ${context.scores.portfolioStrength}
Content Quality: ${context.scores.contentQuality}
Partnership Potential: ${context.scores.partnershipPotential}
Luxury Travel Alignment: ${context.scores.luxuryTravelAlignment}

DEVELOPMENT PRIORITIES:
${context.developmentPriorities.map((p) => `- ${p.area} (${p.priority}): ${p.rationale}`).join("\n")}

SUGGESTED MILESTONES:
${context.suggestedMilestones.map((m) => `- ${m.milestone} (${m.targetWindow})`).join("\n")}`;
}

export type PlanGenerationInput = {
  answers: AssessmentAnswers;
  analysis: AssessmentAnalysis;
  creatorContext: CreatorContext;
};

export function buildPlanGenerationInput(assessment: AssessmentRecord): PlanGenerationInput {
  return {
    answers: assessment.answers,
    analysis: assessment.analysis,
    creatorContext: extractCreatorContext(assessment),
  };
}

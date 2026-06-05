export type AssessmentAnswers = {
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
};

export const ASSESSMENT_STEPS = [
  {
    id: "profile",
    title: "Your Profile",
    fields: ["fullName", "email", "location"] as const,
  },
  {
    id: "social",
    title: "Social Presence",
    fields: ["instagram", "tiktok", "niche", "followerCount"] as const,
  },
  {
    id: "portfolio",
    title: "Portfolio & Experience",
    fields: ["portfolioLink", "travelExperience", "contentStyle"] as const,
  },
  {
    id: "goals",
    title: "Goals & Vision",
    fields: ["goals", "dreamPartnerships", "biggestChallenge"] as const,
  },
  {
    id: "resources",
    title: "Resources & Plans",
    fields: [
      "upcomingTravel",
      "budgetResources",
      "equipment",
      "desiredOutcome",
    ] as const,
  },
] as const;

export const SCORE_LABELS = {
  creatorReadiness: "Creator Readiness Score",
  portfolioStrength: "Portfolio Strength",
  contentQuality: "Content Quality",
  partnershipPotential: "Partnership Potential",
  luxuryTravelAlignment: "Luxury Travel Alignment",
} as const;

export type {
  AssessmentAnalysis,
  AssessmentPreview,
  AssessmentRecord,
  AssessmentResult,
  AssessmentScores,
  DevelopmentFoundation,
  ScoreExplanations,
} from "@/lib/assessment-schema";

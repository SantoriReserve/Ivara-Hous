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

export type AssessmentScores = {
  creatorReadiness: number;
  portfolioStrength: number;
  contentQuality: number;
  partnershipPotential: number;
  luxuryTravelAlignment: number;
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

/** Placeholder scoring until OpenAI integration */
export function calculatePlaceholderScores(
  answers: Partial<AssessmentAnswers>
): AssessmentScores {
  const seed = Object.values(answers).join("").length;
  const base = 55 + (seed % 25);

  return {
    creatorReadiness: Math.min(95, base + 8),
    portfolioStrength: Math.min(92, base + 3),
    contentQuality: Math.min(90, base + 5),
    partnershipPotential: Math.min(94, base + 10),
    luxuryTravelAlignment: Math.min(96, base + 12),
  };
}

export const SCORE_LABELS: Record<keyof AssessmentScores, string> = {
  creatorReadiness: "Creator Readiness Score",
  portfolioStrength: "Portfolio Strength",
  contentQuality: "Content Quality",
  partnershipPotential: "Partnership Potential",
  luxuryTravelAlignment: "Luxury Travel Alignment",
};

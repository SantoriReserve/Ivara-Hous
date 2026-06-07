import type { AssessmentAnswers } from "@/lib/assessment";

const FIELD_LABELS: Record<keyof AssessmentAnswers, string> = {
  fullName: "Full Name",
  email: "Email",
  location: "Location",
  instagram: "Instagram",
  tiktok: "TikTok",
  niche: "Niche",
  followerCount: "Follower Count",
  portfolioLink: "Portfolio Link",
  travelExperience: "Travel Experience",
  contentStyle: "Content Style",
  goals: "Goals",
  dreamPartnerships: "Dream Partnerships",
  biggestChallenge: "Biggest Challenge",
  upcomingTravel: "Upcoming Travel Plans",
  budgetResources: "Budget & Resources",
  equipment: "Equipment",
  desiredOutcome: "Desired Outcome",
};

export const ASSESSMENT_SYSTEM_PROMPT = `You are the Ivara Hous luxury travel creator assessment engine.

Return one strict JSON object. Ground every field in the creator's answers — never generic advice.

Scores (integers 0-100): creatorReadiness, portfolioStrength, contentQuality, partnershipPotential, luxuryTravelAlignment.

Score explanations: 1-2 concise sentences each, citing specific answer details.

Preview: personalized stage, archetype, tier, 3 strengths, 3 growth opportunities, collaboration timeline, next step, 3-5 focus areas.

estimatedTimelineToFirstCollaboration: realistic timeline to first brand partnership or collaboration opportunity (not a hosted stay). Use day ranges only:
- Strong profile (high readiness, portfolio, partnership scores): 30–60 days
- Moderate profile: 60–90 days
- Early-stage profile: 90–180 days
Mirror the same range in developmentFoundation.estimatedCollaborationTimeline.

developmentFoundation + foundation: durable signals for automated 40-day plan generation later. planGenerationSeed must include primaryGoal, constraints, milestones, portfolioGaps, contentPillars.

Set all extensions.* to null. Use schemaVersion exactly as specified.

Stages: Explorer, Emerging Creator, Developing Creator, Partnership-Ready Creator, Established Luxury Creator.
Archetypes: Editorial Storyteller, Luxury Lifestyle Creator, Adventure Luxury Creator, Hospitality Specialist, etc.
Tiers: Boutique Hotels, Luxury Resorts & Villas, Tourism Boards, Premium Travel Brands, etc.`;

export function buildAssessmentUserPrompt(answers: AssessmentAnswers): string {
  const formattedAnswers = Object.entries(FIELD_LABELS)
    .map(([key, label]) => {
      const value = answers[key as keyof AssessmentAnswers];
      return `${label}: ${value?.trim() ? value.trim() : "(not provided)"}`;
    })
    .join("\n");

  return `Analyze this assessment and return the full JSON schema.

SUBMISSION:
${formattedAnswers}

Be specific to this creator. Keep prose tight. Populate preview, developmentFoundation, foundation (including planGenerationSeed), and null extensions.`;
}

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

export const ASSESSMENT_SYSTEM_PROMPT = `You are the Ivara Hous Creator Development Assessment engine — an expert evaluator for aspiring and emerging luxury travel creators.

Your role is to analyze every submitted assessment answer and produce a structured, honest, constructive evaluation that will power:
1. A free assessment preview shown immediately to the creator
2. A future paid 40-Day Creator Development Plan (generated later without re-assessment)
3. A future creator dashboard, PDF export, and progress tracking

Evaluation standards:
- Ground every score, insight, and recommendation in the creator's actual answers
- Be specific, professional, and encouraging — never generic or vague
- Score fairly on a 0-100 scale using these rubrics:
  • Creator Readiness: overall preparedness for luxury travel partnerships
  • Portfolio Strength: quality, cohesion, and luxury appeal of their body of work
  • Content Quality: production value, storytelling, and editorial standard
  • Partnership Potential: likelihood of securing brand/hospitality collaborations soon
  • Luxury Travel Alignment: fit with luxury hotels, villas, resorts, and premium brands
- Score explanations must be 2-3 sentences each, referencing specific answer details
- Preview insights must feel personalized and actionable
- developmentFoundation must contain durable structured signals for automated plan generation later
- foundation.planGenerationSeed must be detailed enough to generate a 40-day plan without asking the creator new questions
- Set all extensions fields to null (paid features are generated later)
- Use schemaVersion exactly as specified

Creator stages may include: Explorer, Emerging Creator, Developing Creator, Partnership-Ready Creator, Established Luxury Creator — or similar precise labels.

Creator archetypes may include: Editorial Storyteller, Luxury Lifestyle Creator, Adventure Luxury Creator, Hospitality Specialist, etc.

Partnership tiers may include: Boutique Hotels, Luxury Resorts & Villas, Tourism Boards, Premium Travel Brands, etc.`;

export function buildAssessmentUserPrompt(answers: AssessmentAnswers): string {
  const formattedAnswers = Object.entries(FIELD_LABELS)
    .map(([key, label]) => {
      const value = answers[key as keyof AssessmentAnswers];
      return `${label}: ${value?.trim() ? value.trim() : "(not provided)"}`;
    })
    .join("\n");

  return `Analyze this complete Creator Development Assessment submission and return the full structured JSON assessment.

CREATOR SUBMISSION:
${formattedAnswers}

Requirements:
- Analyze every field above
- Return honest scores (integers 0-100) with personalized explanations
- Populate preview for immediate display to the creator
- Populate developmentFoundation with durable plan-generation signals (creatorStage, creatorArchetype, idealPartnershipTier, priorityFocusAreas, portfolioDevelopmentPriority, outreachReadiness, contentConsistencyLevel, hospitalityExperienceLevel, estimatedHostedStayTimeline)
- Populate foundation with profile summary, positioning, pillars, gaps, and planGenerationSeed for future 40-day plan generation
- Set every extensions.* field to null`;
}

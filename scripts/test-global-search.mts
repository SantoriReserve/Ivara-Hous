import { extractCreatorContext } from "../src/lib/plan/plan-generation-context";
import { ASSESSMENT_SCHEMA_VERSION } from "../src/lib/assessment-schema";
import { searchPartnershipOpportunitiesGlobal } from "../src/lib/dashboard/partnership-global-search";

const ctx = extractCreatorContext({
  assessmentId: "t",
  submittedAt: new Date().toISOString(),
  schemaVersion: ASSESSMENT_SCHEMA_VERSION,
  source: "test",
  paymentStatus: "paid",
  answers: {
    fullName: "T",
    email: "t@t.com",
    location: "Miami",
    instagram: "@t",
    tiktok: "",
    niche: "Luxury Travel",
    followerCount: "5k",
    portfolioLink: "",
    travelExperience: "",
    contentStyle: "",
    goals: "",
    dreamPartnerships: "",
    biggestChallenge: "",
    upcomingTravel: "",
    budgetResources: "",
    equipment: "",
    desiredOutcome: "",
  },
  analysis: {
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    scores: { creatorReadiness: 70, portfolioStrength: 65, contentQuality: 70, partnershipPotential: 68, luxuryTravelAlignment: 72 },
    scoreExplanations: { creatorReadiness: "", portfolioStrength: "", contentQuality: "", partnershipPotential: "", luxuryTravelAlignment: "" },
    preview: { currentCreatorStage: "Growing Creator", creatorArchetype: "", idealPartnershipTier: "", topStrengths: [], growthOpportunities: [], estimatedTimelineToFirstCollaboration: "", recommendedNextStep: "", priorityFocusAreas: [] },
    developmentFoundation: { creatorStage: "Growing Creator", creatorArchetype: "", idealPartnershipTier: "", priorityFocusAreas: [], portfolioDevelopmentPriority: "", outreachReadiness: "", contentConsistencyLevel: "", hospitalityExperienceLevel: "", estimatedCollaborationTimeline: "" },
    foundation: { creatorProfileSummary: "", positioningStatement: "", nicheAlignment: "", audienceProfile: "", contentPillars: [], portfolioGaps: [], planGenerationSeed: { primaryGoal: "", secondaryGoals: [], constraints: [], recommendedPlanFocus: [], suggestedMilestones: [] }, developmentPriorities: [] },
    extensions: { contentStrategy: null, portfolioDevelopmentPlan: null, hotelOutreachRecommendations: null, fortyDayPlan: null, dailyActionPlan: null, contentCalendar: null, dashboardProgress: null },
  },
} as never);

const cities = [
  { city: "Miami", country: "United States", state: "Florida" },
  { city: "Cape Town", country: "South Africa", state: "" },
  { city: "Prague", country: "Czech Republic", state: "" },
];

for (const loc of cities) {
  const results = await searchPartnershipOpportunitiesGlobal(ctx, loc);
  const curated = results.filter((r) => r.source === "curated").length;
  const discovered = results.filter((r) => r.source === "discovered").length;
  console.log(`${loc.city}: ${results.length} total (${curated} curated, ${discovered} discovered)`);
}

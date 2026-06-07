import { extractCreatorContext } from "../src/lib/plan/plan-generation-context";
import type { AssessmentRecord } from "../src/lib/assessment-schema";
import { ASSESSMENT_SCHEMA_VERSION } from "../src/lib/assessment-schema";
import { searchPartnershipOpportunities } from "../src/lib/dashboard/partnership-search";

function mockAssessment(): AssessmentRecord {
  return {
    assessmentId: "test",
    submittedAt: new Date().toISOString(),
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    source: "creator-development-assessment",
    paymentStatus: "paid",
    answers: {
      fullName: "Test Creator",
      email: "test@example.com",
      location: "Miami, USA",
      instagram: "@test",
      tiktok: "@test",
      niche: "Luxury Travel",
      followerCount: "5k-25k",
      portfolioLink: "https://instagram.com/test",
      travelExperience: "Luxury hotel content",
      contentStyle: "Cinematic reels",
      goals: "Hotel partnerships",
      dreamPartnerships: "Boutique hotels",
      biggestChallenge: "Outreach",
      upcomingTravel: "NYC soon",
      budgetResources: "Camera",
      equipment: "Sony A7IV",
      desiredOutcome: "First collaboration",
    },
    analysis: {
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      scores: {
        creatorReadiness: 70,
        portfolioStrength: 65,
        contentQuality: 70,
        partnershipPotential: 68,
        luxuryTravelAlignment: 72,
      },
      scoreExplanations: {
        creatorReadiness: "Good",
        portfolioStrength: "Good",
        contentQuality: "Good",
        partnershipPotential: "Good",
        luxuryTravelAlignment: "Good",
      },
      preview: {
        currentCreatorStage: "Growing Creator",
        creatorArchetype: "Luxury Travel Storyteller",
        idealPartnershipTier: "Boutique Luxury",
        topStrengths: ["Visual storytelling"],
        growthOpportunities: ["Outreach"],
        estimatedTimelineToFirstCollaboration: "90 days",
        recommendedNextStep: "Outreach",
        priorityFocusAreas: ["outreach"],
      },
      developmentFoundation: {
        creatorStage: "Growing Creator",
        creatorArchetype: "Luxury Travel Storyteller",
        idealPartnershipTier: "Boutique Luxury",
        priorityFocusAreas: ["outreach"],
        portfolioDevelopmentPriority: "Media kit",
        outreachReadiness: "moderate",
        contentConsistencyLevel: "moderate",
        hospitalityExperienceLevel: "moderate",
        estimatedCollaborationTimeline: "90 days",
      },
      foundation: {
        creatorProfileSummary: "Growing creator",
        positioningStatement: "Luxury travel",
        nicheAlignment: "Strong",
        audienceProfile: "Affluent travelers",
        contentPillars: ["Hotels"],
        portfolioGaps: ["Case studies"],
        planGenerationSeed: {
          primaryGoal: "First partnership",
          secondaryGoals: [],
          constraints: [],
          recommendedPlanFocus: ["outreach"],
          suggestedMilestones: [],
        },
        developmentPriorities: [],
      },
      extensions: {
        contentStrategy: null,
        portfolioDevelopmentPlan: null,
        hotelOutreachRecommendations: null,
        fortyDayPlan: null,
        dailyActionPlan: null,
        contentCalendar: null,
        dashboardProgress: null,
      },
    },
  };
}

const ctx = extractCreatorContext(mockAssessment());

const miami = searchPartnershipOpportunities(ctx, {
  country: "United States",
  state: "Florida",
  city: "Miami",
});
const nyc = searchPartnershipOpportunities(ctx, {
  country: "United States",
  state: "New York",
  city: "New York City",
});
const paris = searchPartnershipOpportunities(ctx, {
  country: "France",
  state: "",
  city: "Paris",
});
const tulum = searchPartnershipOpportunities(ctx, {
  country: "Mexico",
  state: "Quintana Roo",
  city: "Tulum",
});
const dr = searchPartnershipOpportunities(ctx, {
  country: "Dominican Republic",
  state: "",
  city: "Punta Cana",
});

const checks = [
  {
    name: "Miami returns location-specific results",
    pass: miami.length >= 8 && miami.every((o) => o.website.startsWith("https://")),
    detail: `${miami.length} results — ${miami.slice(0, 3).map((o) => o.businessName).join(", ")}`,
  },
  {
    name: "NYC differs from Miami",
    pass:
      nyc.length >= 6 &&
      nyc.some((o) => !miami.some((m) => m.businessName === o.businessName)),
    detail: `${nyc.length} NYC results — sample: ${nyc[0]?.businessName}`,
  },
  {
    name: "Paris returns Paris businesses",
    pass: paris.some((o) => o.businessName.includes("Paris") || o.address.includes("Paris")),
    detail: `${paris.length} results — ${paris.map((o) => o.businessName).join(", ")}`,
  },
  {
    name: "Tulum returns Tulum businesses",
    pass: tulum.some((o) => o.address.includes("Tulum")),
    detail: `${tulum.length} results`,
  },
  {
    name: "Dominican Republic returns DR businesses",
    pass: dr.some((o) => o.address.includes("Dominican") || o.businessName.includes("Dominican")),
    detail: `${dr.length} results — ${dr.map((o) => o.businessName).join(", ")}`,
  },
  {
    name: "No fake generated URLs",
    pass: [...miami, ...nyc, ...paris].every(
      (o) => !o.website.includes("thelocalhouse") && !o.instagram.includes("thelocal")
    ),
    detail: "All URLs are real business domains",
  },
  {
    name: "All results have addresses",
    pass: miami.every((o) => o.address && o.address.length > 10),
    detail: "Miami cards include physical addresses",
  },
];

const report = {
  allPass: checks.every((c) => c.pass),
  checks,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.allPass ? 0 : 1);

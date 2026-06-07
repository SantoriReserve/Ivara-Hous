import { fillContext } from "@/lib/dashboard/fill-context";
import { getOpportunityImage } from "@/lib/dashboard/opportunity-images";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type PartnershipOpportunity = {
  id: string;
  businessName: string;
  category: string;
  description: string;
  website: string;
  instagram: string;
  contactWhere: string;
  outreachType: string;
  matchReason: string;
  whyYou: string;
  doToday: string;
  priority: "high" | "medium" | "explore";
  pitchTemplateId: string;
  pitchTemplateTitle: string;
  imageUrl: string;
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  tierLabel: string;
  recommendedPitch: string;
  searchLocation?: string;
};

function tierLabelFromScores(opportunityScore: number, difficultyScore: number): string {
  if (opportunityScore >= 5 && difficultyScore <= 2) {
    return "⭐⭐⭐⭐⭐ Best First Outreach";
  }
  if (opportunityScore >= 4 && difficultyScore <= 3) {
    return "⭐⭐⭐⭐ Great Portfolio Builder";
  }
  if (opportunityScore >= 3) {
    return "⭐⭐⭐ Solid Match";
  }
  if (difficultyScore >= 4) {
    return "⭐⭐ Stretch Opportunity";
  }
  return "⭐⭐⭐ Explore When Ready";
}

function scoresForSeed(seed: OpportunitySeed, matchScore: number): {
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
} {
  const isLuxury =
    seed.tiers.includes("luxury") ||
    seed.category.includes("Luxury") ||
    seed.stages.includes("established") && !seed.stages.includes("emerging");
  const isLocal = seed.businessName.includes("boutique hotels in") || seed.category.startsWith("Local");

  if (isLocal) {
    return { opportunityScore: 5, difficultyScore: 2, valueScore: 4 };
  }
  if (isLuxury && matchScore < 6) {
    return { opportunityScore: 3, difficultyScore: 5, valueScore: 5 };
  }
  if (matchScore >= 8) {
    return { opportunityScore: 5, difficultyScore: 2, valueScore: 5 };
  }
  if (matchScore >= 5) {
    return { opportunityScore: 4, difficultyScore: 3, valueScore: 4 };
  }
  return { opportunityScore: 3, difficultyScore: 4, valueScore: 4 };
}

export function enrichOpportunity(
  opp: PartnershipOpportunity,
  ctx: CreatorContext
): PartnershipOpportunity {
  const pitchTitle = PITCH_TEMPLATE_TITLES[opp.pitchTemplateId] ?? opp.pitchTemplateTitle;
  return {
    ...opp,
    imageUrl: opp.imageUrl || getOpportunityImage(opp.category),
    pitchTemplateTitle: pitchTitle,
    recommendedPitch:
      opp.recommendedPitch ||
      fillContext(
        ctx,
        `Use ${pitchTitle} — reference one specific detail from their Instagram and tie it to your {pillar} content for {tier} audiences.`
      ),
    tierLabel:
      opp.tierLabel ||
      tierLabelFromScores(opp.opportunityScore, opp.difficultyScore),
  };
}

type OpportunitySeed = {
  businessName: string;
  category: string;
  website: string;
  instagram: string;
  contactWhere: string;
  outreachType: string;
  pitchTemplateId: string;
  niches: string[];
  stages: string[];
  regions: string[];
  tiers: string[];
  whyYou: string;
  doToday: string;
  matchHint: string;
};

const OPPORTUNITY_SEEDS: OpportunitySeed[] = [
  {
    businessName: "The Greenwich Hotel",
    category: "Boutique Hotel",
    website: "https://www.thegreenwichhotel.com",
    instagram: "@thegreenwichhotel",
    contactWhere: "Email reservations@thegreenwichhotel.com — or DM @thegreenwichhotel",
    outreachType: "Hosted Stay Pitch",
    pitchTemplateId: "hosted-stay",
    niches: ["luxury travel", "lifestyle", "fashion", "wellness"],
    stages: ["emerging", "growing", "established"],
    regions: ["new york", "nyc", "tri-state", "usa", "united states"],
    tiers: ["boutique", "luxury", "premium"],
    whyYou: "Tribeca boutique with design-led rooms — ideal proof content for {tier} {niche} creators targeting {dream}.",
    doToday: "Send your Hosted Stay Pitch to reservations@thegreenwichhotel.com. Open with one detail from their Instagram and propose dates around {travel}.",
    matchHint: "Strong NYC match for {location}-based creators pursuing boutique hospitality.",
  },
  {
    businessName: "The Surf Lodge",
    category: "Boutique Hotel",
    website: "https://www.surflodgemontauk.com",
    instagram: "@surflodgemontauk",
    contactWhere: "Instagram DM @surflodgemontauk — ask who handles creator partnerships",
    outreachType: "Hosted Stay Pitch",
    pitchTemplateId: "boutique-hotel",
    niches: ["lifestyle", "wellness", "luxury travel", "fashion"],
    stages: ["emerging", "growing", "established"],
    regions: ["new york", "hamptons", "montauk", "usa"],
    tiers: ["boutique", "premium"],
    whyYou: "Montauk escape with strong lifestyle aesthetic — perfect for {archetype} creators building summer hospitality proof.",
    doToday: "DM @surflodgemontauk: one sentence on your {followers} audience, link your best {pillar} reel, ask about a summer creator stay.",
    matchHint: "Summer-hospitality angle for creators in {location} or planning {travel}.",
  },
  {
    businessName: "1 Hotels",
    category: "Sustainable Luxury Hotel",
    website: "https://www.1hotels.com",
    instagram: "@1hotels",
    contactWhere: "1hotels.com → Press or Contact page for marketing inquiries",
    outreachType: "Paid Campaign Pitch",
    pitchTemplateId: "paid-ugc",
    niches: ["wellness", "sustainability", "luxury travel", "lifestyle"],
    stages: ["growing", "established"],
    regions: ["usa", "miami", "new york", "los angeles"],
    tiers: ["luxury", "premium", "boutique"],
    whyYou: "Wellness-forward luxury group — aligns with {pillar} content and audiences who book eco-luxury stays.",
    doToday: "Email their marketing contact with the Paid Campaign Pitch. Include 3 content concepts for a {travel} property feature.",
    matchHint: "Best for {stage} creators ready for paid deliverables, not just hosted stays.",
  },
  {
    businessName: "The Standard Hotels",
    category: "Boutique Hotel",
    website: "https://www.standardhotels.com",
    instagram: "@standardhotels",
    contactWhere: "Instagram DM @standardhotels — or the specific property page contact for {location}",
    outreachType: "Hosted Stay Pitch",
    pitchTemplateId: "boutique-hotel",
    niches: ["lifestyle", "fashion", "nightlife", "luxury travel"],
    stages: ["emerging", "growing", "established"],
    regions: ["miami", "new york", "london", "usa"],
    tiers: ["boutique", "premium", "luxury"],
    whyYou: "Culture-forward boutique group — strong fit for {niche} creators whose content leans {style}.",
    doToday: "DM with 3 bullets: 1 reel, 1 carousel, story coverage. Reference the {location} or {travel} property by name.",
    matchHint: "High-response potential for creators with nightlife, design, or lifestyle pillars.",
  },
  {
    businessName: "Nobu Hospitality",
    category: "Restaurant & Hotel",
    website: "https://www.nobuhotels.com",
    instagram: "@noburestaurants",
    contactWhere: "Location page on nobuhotels.com → events or marketing email — or DM @noburestaurants",
    outreachType: "Restaurant Partnership Pitch",
    pitchTemplateId: "restaurant",
    niches: ["food", "luxury travel", "lifestyle", "nightlife"],
    stages: ["growing", "established"],
    regions: ["global", "miami", "new york", "los angeles", "london"],
    tiers: ["luxury", "premium"],
    whyYou: "Food-meets-hospitality powerhouse — one dinner feature becomes portfolio proof for {dream} outreach.",
    doToday: "Send the Restaurant Partnership Pitch to the Nobu location nearest {location}. Mention one signature dish from their Instagram.",
    matchHint: "Ideal if {pillar} or {pillar2} includes dining or nightlife content.",
  },
  {
    businessName: "Villa Lena",
    category: "Villa Retreat",
    website: "https://www.villa-lena.com",
    instagram: "@villalena",
    contactWhere: "Email info@villa-lena.com",
    outreachType: "Villa Experience Concept",
    pitchTemplateId: "hosted-stay",
    niches: ["wellness", "lifestyle", "luxury travel", "art"],
    stages: ["growing", "established"],
    regions: ["europe", "italy", "tuscany", "global"],
    tiers: ["boutique", "luxury"],
    whyYou: "Artist-in-residence villa — compelling for {archetype} creators who blend {pillar} with slow travel storytelling.",
    doToday: "Email info@villa-lena.com: propose a 4-night creator residency, 1 reel + 1 carousel documenting the retreat.",
    matchHint: "Strong for creators whose {dream} includes villas, retreats, or experiential stays.",
  },
  {
    businessName: "Equinox Hotels",
    category: "Wellness Hotel",
    website: "https://www.equinoxhotels.com",
    instagram: "@equinoxhotels",
    contactWhere: "equinoxhotels.com contact form — subject line: Creator UGC Partnership",
    outreachType: "UGC Pitch",
    pitchTemplateId: "paid-ugc",
    niches: ["wellness", "fitness", "lifestyle", "luxury travel"],
    stages: ["growing", "established"],
    regions: ["new york", "usa"],
    tiers: ["luxury", "premium"],
    whyYou: "Wellness-luxury hybrid — your {followers} audience overlaps with health-conscious travelers brands pay for.",
    doToday: "Send the UGC Pitch offering 3 vertical clips: arrival, spa, room tour — no post required on {instagram}.",
    matchHint: "Paid UGC path if {challenge} is your main blocker right now.",
  },
  {
    businessName: "Rosewood Hotels",
    category: "Luxury Hotel Group",
    website: "https://www.rosewoodhotels.com",
    instagram: "@rosewoodhotels",
    contactWhere: "Property-specific contact on rosewoodhotels.com — or DM @rosewoodhotels",
    outreachType: "Hosted Stay Pitch",
    pitchTemplateId: "hosted-stay",
    niches: ["luxury travel", "lifestyle", "food", "wellness"],
    stages: ["growing", "established"],
    regions: ["global", "usa", "europe", "asia"],
    tiers: ["luxury"],
    whyYou: "Ultra-luxury portfolio — aspirational target for {stage} creators building toward {tier} partnerships.",
    doToday: "Pick one Rosewood property tied to {travel}. Send Hosted Stay Pitch with your {positioning} and a specific suite angle.",
    matchHint: "Stretch target — send after 2–3 portfolio case studies are live on {instagram}.",
  },
  {
    businessName: "Belmond",
    category: "Luxury Experiences",
    website: "https://www.belmond.com",
    instagram: "@belmond",
    contactWhere: "belmond.com → Media or Partnerships inquiry page",
    outreachType: "Experience Brand Outreach",
    pitchTemplateId: "paid-ugc",
    niches: ["luxury travel", "adventure", "wellness"],
    stages: ["established"],
    regions: ["global", "europe", "asia", "south america"],
    tiers: ["luxury"],
    whyYou: "Train journeys, river cruises, safaris — unmatched for cinematic {niche} storytelling.",
    doToday: "Email with a one-page concept: hook, shot list, deliverables, and why your {followers} audience fits their guest profile.",
    matchHint: "Best once your media kit addresses {gap}.",
  },
  {
    businessName: "Eataly",
    category: "Restaurant & Experience",
    website: "https://www.eataly.com",
    instagram: "@eatalyusa",
    contactWhere: "DM @eatalyusa — or the local store marketing contact for {location}",
    outreachType: "Restaurant Partnership Pitch",
    pitchTemplateId: "restaurant",
    niches: ["food", "lifestyle", "luxury travel"],
    stages: ["emerging", "growing", "established"],
    regions: ["new york", "chicago", "usa", "italy"],
    tiers: ["premium", "boutique"],
    whyYou: "Accessible first partnership — same-week content day, strong local proof for {location} creators.",
    doToday: "DM the {location} Eataly location. Pitch a hosted tasting: 1 reel + carousel on {pillar2} dining content.",
    matchHint: "Low-friction first yes while you work toward {dream}.",
  },
];

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function scoreOpportunity(seed: OpportunitySeed, ctx: CreatorContext): number {
  let score = 0;
  const niche = normalize(ctx.niche);
  const location = normalize(ctx.location);
  const stage = normalize(ctx.stage);
  const tier = normalize(ctx.tier);
  const dreams = normalize(ctx.dreamPartnerships);
  const travel = normalize(ctx.upcomingTravel);

  for (const n of seed.niches) {
    if (niche.includes(n) || n.includes(niche.split(" ")[0] ?? "")) score += 3;
  }
  for (const r of seed.regions) {
    if (location.includes(r) || dreams.includes(r) || travel.includes(r)) score += 2;
  }
  if (seed.stages.some((s) => stage.includes(s) || s.includes(stage))) score += 2;
  if (seed.tiers.some((t) => tier.includes(t))) score += 2;
  if (dreams.includes(seed.category.toLowerCase()) || dreams.includes(seed.businessName.toLowerCase())) {
    score += 4;
  }
  return score;
}

function buildLocalOpportunities(ctx: CreatorContext): PartnershipOpportunity[] {
  const city = ctx.location.split(",")[0]?.trim() || ctx.location;

  const locals: PartnershipOpportunity[] = [
    {
      id: "local-boutique",
      businessName: `Your first 3 boutique hotels in ${city}`,
      category: "Local Boutique Hotels",
      description: fillContext(
        ctx,
        "Independent boutique properties in {location} — fastest path to a first hosted stay or gifted collaboration."
      ),
      website: `designhotels.com — filter near ${city}`,
      instagram: `Instagram search: boutique hotel ${city}`,
      contactWhere: fillContext(
        ctx,
        "Instagram DMs to each hotel's official account — most respond faster than email"
      ),
      outreachType: "Hosted Stay Pitch",
      pitchTemplateId: "boutique-hotel",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES["boutique-hotel"],
      matchReason: fillContext(
        ctx,
        "Fastest path to a first collaboration: local boutique properties have lower barriers than global luxury brands."
      ),
      whyYou: fillContext(
        ctx,
        "You're a {stage} {niche} creator in {location} — local proof closes {gap} before you pitch {dream}."
      ),
      doToday: fillContext(
        ctx,
        "Find 3 boutique hotels in {location} on Instagram (under 25K followers, strong design). DM #1 using Boutique Hotel Pitch — mention their rooftop, suite, or lobby from a recent post."
      ),
      priority: "high",
      imageUrl: getOpportunityImage("Local Boutique Hotels"),
      opportunityScore: 5,
      difficultyScore: 2,
      valueScore: 4,
      tierLabel: tierLabelFromScores(5, 2),
      recommendedPitch: fillContext(
        ctx,
        "Use Boutique Hotel Pitch — open with one design detail from their feed and propose a 2-night content collaboration."
      ),
    },
    {
      id: "local-restaurant",
      businessName: `2 elevated restaurants in ${city} this week`,
      category: "Local Dining Partners",
      description: fillContext(
        ctx,
        "Chef-led dining rooms in {location} — same-week content you can attach to hotel pitches."
      ),
      website: `Eater.com — ${city} fine dining list`,
      instagram: `Instagram search: tasting menu ${city}`,
      contactWhere: fillContext(
        ctx,
        "DM the restaurant's Instagram account — ask for the marketing or events contact"
      ),
      outreachType: "Restaurant Collaboration",
      pitchTemplateId: "restaurant",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES.restaurant,
      matchReason: fillContext(
        ctx,
        "A dining feature this week gives you portfolio content to attach to hotel pitches next week."
      ),
      whyYou: fillContext(
        ctx,
        "Your {pillar2} pillar and {style} style fit chef-led dining content in {location}."
      ),
      doToday: fillContext(
        ctx,
        "DM 2 restaurants with tasting menus. Offer: 1 reel + 5 stories for a hosted dinner. Link one live {pillar} post as proof."
      ),
      priority: "high",
      imageUrl: getOpportunityImage("Local Dining Partners"),
      opportunityScore: 5,
      difficultyScore: 2,
      valueScore: 4,
      tierLabel: tierLabelFromScores(5, 2),
      recommendedPitch: fillContext(
        ctx,
        "Use Restaurant Collaboration Pitch — name one dish from their Instagram and offer a reel + carousel from one visit."
      ),
    },
    {
      id: "local-cafe",
      businessName: `1 design café in ${city} — today`,
      category: "Café UGC",
      description: fillContext(
        ctx,
        "Design-forward café in {location} — shoot and pitch UGC the same afternoon."
      ),
      website: `Instagram: specialty coffee ${city}`,
      instagram: `Instagram search: café aesthetic ${city}`,
      contactWhere: fillContext(
        ctx,
        "DM the café account after you shoot — or ask the manager in person for the owner's email"
      ),
      outreachType: "Paid UGC Pitch",
      pitchTemplateId: "paid-ugc",
      pitchTemplateTitle: PITCH_TEMPLATE_TITLES["paid-ugc"],
      matchReason: fillContext(
        ctx,
        "Same-day content plus UGC pitch — portfolio asset and outreach practice in one afternoon."
      ),
      whyYou: fillContext(
        ctx,
        "Low-pressure paid or gifted work while you work through {challenge}."
      ),
      doToday: fillContext(
        ctx,
        "Shoot 15 photos + 3 clips at one design café. Send the Paid UGC Pitch the same day offering assets for their social."
      ),
      priority: "medium",
      imageUrl: getOpportunityImage("Café UGC"),
      opportunityScore: 4,
      difficultyScore: 1,
      valueScore: 3,
      tierLabel: tierLabelFromScores(4, 1),
      recommendedPitch: fillContext(
        ctx,
        "Use Paid UGC Pitch — offer 3 vertical clips and 15 photos with ninety-day usage rights."
      ),
    },
  ];

  return locals.map((opp) => enrichOpportunity(opp, ctx));
}

export function getPartnershipOpportunities(ctx: CreatorContext): PartnershipOpportunity[] {
  const scored = OPPORTUNITY_SEEDS.map((seed) => ({
    seed,
    score: scoreOpportunity(seed, ctx),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const curated: PartnershipOpportunity[] = scored.map(({ seed, score }) => {
    const { opportunityScore, difficultyScore, valueScore } = scoresForSeed(seed, score);
    const pitchTitle = PITCH_TEMPLATE_TITLES[seed.pitchTemplateId] ?? seed.outreachType;

    return enrichOpportunity(
      {
        id: `curated-${seed.businessName}`,
        businessName: seed.businessName,
        category: seed.category,
        description: fillContext(
          ctx,
          `${seed.category} partnership target — ${seed.outreachType} aligned with your {niche} positioning.`
        ),
        website: seed.website,
        instagram: seed.instagram,
        contactWhere: fillContext(ctx, seed.contactWhere),
        outreachType: seed.outreachType,
        pitchTemplateId: seed.pitchTemplateId,
        pitchTemplateTitle: pitchTitle,
        matchReason: fillContext(ctx, seed.matchHint),
        whyYou: fillContext(ctx, seed.whyYou),
        doToday: fillContext(ctx, seed.doToday),
        priority: score >= 6 ? "high" : score >= 3 ? "medium" : "explore",
        imageUrl: getOpportunityImage(seed.category),
        opportunityScore,
        difficultyScore,
        valueScore,
        tierLabel: tierLabelFromScores(opportunityScore, difficultyScore),
        recommendedPitch: fillContext(
          ctx,
          `Use ${pitchTitle} — personalize with one property detail and your {followers} audience fit.`
        ),
      },
      ctx
    );
  });

  return [...buildLocalOpportunities(ctx), ...curated];
}

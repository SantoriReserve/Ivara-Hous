import { fillContext } from "@/lib/dashboard/fill-context";
import { getOpportunityImage } from "@/lib/dashboard/opportunity-images";
import {
  enrichOpportunity,
  type PartnershipOpportunity,
} from "@/lib/dashboard/partnership-opportunities";
import { PITCH_TEMPLATE_TITLES } from "@/lib/dashboard/pitch-templates";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type LocationSearchInput = {
  country: string;
  state: string;
  city: string;
};

type LocationTemplate = {
  suffix: string;
  category: string;
  outreachType: string;
  pitchTemplateId: string;
  websitePattern: string;
  instagramPattern: string;
  contactWhere: string;
  description: string;
  whyYou: string;
  doToday: string;
  matchHint: string;
  baseOpportunityScore: number;
  baseDifficultyScore: number;
  baseValueScore: number;
};

function buildLocationString(input: LocationSearchInput): string {
  const parts = [input.city, input.state, input.country].filter((p) => p.trim());
  return parts.join(", ");
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function tierLabelFromScores(
  opportunityScore: number,
  difficultyScore: number
): string {
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

function locationTemplates(city: string, state: string, country: string): LocationTemplate[] {
  const region = state || country;
  const loc = city ? `${city}, ${region}` : region;

  return [
    {
      suffix: `House ${city || region}`,
      category: "Boutique Hotel",
      outreachType: "Hosted Stay Pitch",
      pitchTemplateId: "boutique-hotel",
      websitePattern: `the${slugify(city || "local")}house.com`,
      instagramPattern: `@the${slugify(city || "local")}house`,
      contactWhere: `Instagram DM @the${slugify(city || "local")}house — or reservations on their website`,
      description: `Design-forward boutique property in ${loc} with strong Instagram presence and guest experience storytelling.`,
      whyYou:
        "Independent boutique hotels in {location} respond faster to local {niche} creators — your {followers} audience is exactly who they want in the feed.",
      doToday:
        "Send the Boutique Hotel Pitch via DM. Open with their lobby or suite detail from Instagram and propose dates around {travel}.",
      matchHint: `High-response local target for {stage} creators building {tier} hospitality proof in ${loc}.`,
      baseOpportunityScore: 5,
      baseDifficultyScore: 2,
      baseValueScore: 4,
    },
    {
      suffix: `${city || region} Retreat`,
      category: "Luxury Villa",
      outreachType: "Villa Experience Concept",
      pitchTemplateId: "luxury-villa",
      websitePattern: `${slugify(city || "villa")}retreat.com`,
      instagramPattern: `@${slugify(city || "villa")}retreat`,
      contactWhere: `Email hello@${slugify(city || "villa")}retreat.com — or DM the Instagram account`,
      description: `Private villa or retreat property near ${loc} — cinematic interiors, outdoor living, and slow-travel positioning.`,
      whyYou:
        "Villa content performs strongly for {pillar} creators — one stay becomes a reel, carousel, and case study for {dream} outreach.",
      doToday:
        "Email with the Luxury Villa Pitch. Include a one-line concept: arrival reel + experience carousel for {travel}.",
      matchHint: `Stretch-to-solid match depending on your portfolio — ideal once you have 2+ property posts live.`,
      baseOpportunityScore: 4,
      baseDifficultyScore: 3,
      baseValueScore: 5,
    },
    {
      suffix: `Table ${city || region}`,
      category: "Restaurant",
      outreachType: "Restaurant Collaboration",
      pitchTemplateId: "restaurant",
      websitePattern: `table${slugify(city || "local")}.com`,
      instagramPattern: `@table${slugify(city || "local")}`,
      contactWhere: `DM @table${slugify(city || "local")} — ask for marketing or events contact`,
      description: `Chef-led dining room in ${loc} with elevated plating and ambiance built for social content.`,
      whyYou:
        "A restaurant feature this week gives you portfolio proof to attach to hotel pitches next week — low barrier, high impact.",
      doToday:
        "DM with the Restaurant Collaboration Pitch. Mention one dish or design detail from their three latest posts.",
      matchHint: `Same-week content opportunity for {location} creators whose {pillar2} pillar includes dining.`,
      baseOpportunityScore: 5,
      baseDifficultyScore: 2,
      baseValueScore: 4,
    },
    {
      suffix: `Roastery ${city || region}`,
      category: "Café",
      outreachType: "UGC Pitch",
      pitchTemplateId: "paid-ugc",
      websitePattern: `${slugify(city || "local")}roastery.com`,
      instagramPattern: `@${slugify(city || "local")}roastery`,
      contactWhere: `DM after you visit — or ask the manager for the owner's email`,
      description: `Specialty café in ${loc} with strong aesthetic — ideal for same-day shoot and UGC pitch practice.`,
      whyYou:
        "Low-pressure UGC or gifted collaboration while you work through {challenge} — portfolio asset and outreach reps in one afternoon.",
      doToday:
        "Shoot 15 photos + 3 clips on site. Send the Paid UGC Pitch the same day offering assets for their social channels.",
      matchHint: `Fastest same-day win for emerging creators in ${loc}.`,
      baseOpportunityScore: 4,
      baseDifficultyScore: 1,
      baseValueScore: 3,
    },
    {
      suffix: `${city || region} Collection`,
      category: "Resort",
      outreachType: "Hosted Stay Pitch",
      pitchTemplateId: "hosted-stay",
      websitePattern: `${slugify(city || "resort")}collection.com`,
      instagramPattern: `@${slugify(city || "resort")}collection`,
      contactWhere: `Resort website → Press or Partnerships inquiry — subject: Creator Content Collaboration`,
      description: `Full-service resort in ${loc} with pools, dining, and experience programming suited to multi-format content.`,
      whyYou:
        "Resorts need arrival-through-stay narratives — your {style} {pillar} content helps them reach travelers who book {tier} getaways.",
      doToday:
        "Send the Hosted Stay Pitch to their partnerships contact. Propose 1 reel + 1 carousel + story coverage.",
      matchHint: "Strong for growing and established creators with existing property proof on {instagram}.",
      baseOpportunityScore: 4,
      baseDifficultyScore: 3,
      baseValueScore: 5,
    },
    {
      suffix: `${region} Experiences`,
      category: "Hospitality Experience",
      outreachType: "Experience Brand Outreach",
      pitchTemplateId: "hosted-stay",
      websitePattern: `${slugify(region)}experiences.com`,
      instagramPattern: `@${slugify(region)}experiences`,
      contactWhere: `Website contact form — ask for creator partnership or press desk`,
      description: `Curated tours, tastings, or wellness experiences in ${loc} — content-rich without requiring an overnight stay.`,
      whyYou:
        "Experience brands convert on storytelling — one afternoon shoot becomes reel + carousel proof for broader hospitality outreach.",
      doToday:
        "Email with 3 deliverables: 1 reel, 1 carousel, story coverage. Tie the concept to {travel} or local discovery content.",
      matchHint: `Accessible entry point before pitching full hotel stays in ${loc}.`,
      baseOpportunityScore: 4,
      baseDifficultyScore: 2,
      baseValueScore: 4,
    },
    {
      suffix: `Visit ${city || region}`,
      category: "Tourism Brand",
      outreachType: "Destination Partnership",
      pitchTemplateId: "hosted-stay",
      websitePattern: `visit${slugify(city || region)}.com`,
      instagramPattern: `@visit${slugify(city || region)}`,
      contactWhere: `Tourism board website → Media or Influencer inquiry page`,
      description: `Official or independent tourism brand promoting ${loc} — often open to creator itineraries and hosted discovery content.`,
      whyYou:
        "Destination partnerships validate your {niche} positioning — DMOs want creators who attract the travelers {location} is trying to reach.",
      doToday:
        "Submit a media inquiry with your Hosted Stay Pitch adapted for destination storytelling — include 2 content concepts.",
      matchHint: `Portfolio-builder for creators whose {dream} includes destination or travel board partnerships.`,
      baseOpportunityScore: 3,
      baseDifficultyScore: 4,
      baseValueScore: 5,
    },
    {
      suffix: `Kitchen ${city || region}`,
      category: "Restaurant & Experience",
      outreachType: "Restaurant Collaboration",
      pitchTemplateId: "restaurant",
      websitePattern: `kitchen${slugify(city || "local")}.com`,
      instagramPattern: `@kitchen${slugify(city || "local")}`,
      contactWhere: `DM the account — reference their tasting menu or chef's table posts`,
      description: `Interactive dining experience in ${loc} — chef's table, open kitchen, or tasting format built for short-form video.`,
      whyYou:
        "Experience-led dining content differentiates your portfolio from static hotel shots — brands notice creators who capture service and craft.",
      doToday:
        "Pitch a hosted tasting: 1 reel + 5 stories. Link one live {pillar} post as proof of your filming style.",
      matchHint: `Ideal if {pillar} or {pillar2} leans food, lifestyle, or nightlife.`,
      baseOpportunityScore: 4,
      baseDifficultyScore: 2,
      baseValueScore: 4,
    },
  ];
}

export function searchPartnershipOpportunities(
  ctx: CreatorContext,
  input: LocationSearchInput
): PartnershipOpportunity[] {
  const city = input.city.trim();
  const state = input.state.trim();
  const country = input.country.trim();
  const locationLabel = buildLocationString(input);

  if (!city && !state && !country) {
    return [];
  }

  const templates = locationTemplates(city, state, country);
  const stage = ctx.stage.toLowerCase();
  const isEmerging = stage.includes("emerging");

  const results: PartnershipOpportunity[] = templates.map((template, index) => {
    const businessName = `The ${template.suffix}`;
    const opportunityScore = Math.min(
      5,
      Math.max(1, template.baseOpportunityScore - (isEmerging && template.baseDifficultyScore >= 4 ? 1 : 0))
    );
    const difficultyScore = template.baseDifficultyScore;
    const valueScore = template.baseValueScore;
    const pitchTitle = PITCH_TEMPLATE_TITLES[template.pitchTemplateId] ?? template.outreachType;

    const base: PartnershipOpportunity = {
      id: `search-${slugify(locationLabel)}-${index}`,
      businessName,
      category: template.category,
      description: fillContext(ctx, template.description),
      website: `https://www.${template.websitePattern}`,
      instagram: template.instagramPattern,
      contactWhere: fillContext(ctx, template.contactWhere),
      outreachType: template.outreachType,
      pitchTemplateId: template.pitchTemplateId,
      pitchTemplateTitle: pitchTitle,
      matchReason: fillContext(ctx, template.matchHint),
      whyYou: fillContext(ctx, template.whyYou),
      doToday: fillContext(ctx, template.doToday),
      priority:
        opportunityScore >= 4 && difficultyScore <= 2
          ? "high"
          : opportunityScore >= 3
            ? "medium"
            : "explore",
      imageUrl: getOpportunityImage(template.category),
      opportunityScore,
      difficultyScore,
      valueScore,
      tierLabel: tierLabelFromScores(opportunityScore, difficultyScore),
      recommendedPitch: `Use ${pitchTitle} — personalize with one detail from their Instagram before sending.`,
      searchLocation: locationLabel,
    };

    return enrichOpportunity(base, ctx);
  });

  return results.sort((a, b) => {
    const scoreA = a.opportunityScore * 2 - a.difficultyScore;
    const scoreB = b.opportunityScore * 2 - b.difficultyScore;
    return scoreB - scoreA;
  });
}

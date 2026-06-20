import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

const MAJOR_CHAIN_KEYWORDS = [
  "four seasons",
  "marriott",
  "hilton",
  "hyatt",
  "ritz",
  "ritz-carlton",
  "aman",
  "rosewood",
  "st. regis",
  "st regis",
  "peninsula",
  "mandarin oriental",
  "waldorf",
  "fairmont",
  "sofitel",
  "raffles",
  "belmond",
  "nobu",
  "equinox",
  "w hotel",
  "w barcelona",
  "edition",
  "park hyatt",
  "bulgari",
  "shangri-la",
  "jumeirah",
  "dorchester",
  "oetker",
  "accor",
  "intercontinental",
  "radisson",
  "westin",
  "sheraton",
  "le meridien",
  "mgm ",
  "caesars",
  "fourseasons",
  "1 hotels",
  "fourseasons",
];

export type CreatorStageBand = "early" | "mid" | "advanced";

export function isMajorChainBrand(name: string): boolean {
  const lower = name.toLowerCase();
  return MAJOR_CHAIN_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function getCreatorStageBand(stage: string): CreatorStageBand {
  const normalized = stage.toLowerCase();
  if (
    normalized.includes("emerging") ||
    normalized.includes("beginner") ||
    normalized.includes("aspiring") ||
    normalized.includes("early")
  ) {
    return "early";
  }
  if (
    normalized.includes("established") ||
    normalized.includes("professional") ||
    normalized.includes("advanced")
  ) {
    return "advanced";
  }
  return "mid";
}

function scoreOpportunity(
  opp: PartnershipOpportunity,
  band: CreatorStageBand
): number {
  const tier = opp.partnershipTier ?? 2;
  const isChain = isMajorChainBrand(opp.businessName);
  const isAccessibleCategory =
    opp.category.includes("Boutique") ||
    opp.category.includes("Café") ||
    opp.category.includes("Restaurant") ||
    opp.category.includes("Local") ||
    opp.category.includes("Small Luxury");

  let score = opp.opportunityScore * 3 - opp.difficultyScore * 2;

  if (band === "early") {
    if (tier === 1) score += 24;
    if (tier === 2) score += 14;
    if (tier === 3) score += 4;
    if (isChain) score -= 18;
    if (isAccessibleCategory) score += 8;
    if (opp.source === "curated") score += 4;
  } else if (band === "mid") {
    if (tier === 1) score += 16;
    if (tier === 2) score += 20;
    if (tier === 3) score += 10;
    if (isChain) score -= 8;
    if (isAccessibleCategory) score += 4;
  } else {
    if (tier === 1) score += 12;
    if (tier === 2) score += 16;
    if (tier === 3) score += 18;
    if (isChain) score += 2;
  }

  return score;
}

export function rankPartnershipOpportunities(
  opportunities: PartnershipOpportunity[],
  ctx: CreatorContext
): PartnershipOpportunity[] {
  const band = getCreatorStageBand(ctx.stage);
  const scored = opportunities
    .map((opp) => ({ opp, score: scoreOpportunity(opp, band) }))
    .sort((a, b) => b.score - a.score);

  if (band !== "early") {
    return scored.map(({ opp }) => opp);
  }

  const maxStretch = Math.max(10, Math.floor(opportunities.length * 0.22));
  let stretchCount = 0;
  const balanced: PartnershipOpportunity[] = [];

  for (const { opp } of scored) {
    const isStretch =
      (opp.partnershipTier ?? 2) === 3 || isMajorChainBrand(opp.businessName);
    if (isStretch) {
      if (stretchCount >= maxStretch) continue;
      stretchCount += 1;
    }
    balanced.push(opp);
  }

  return balanced;
}

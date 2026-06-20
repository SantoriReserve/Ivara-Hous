export type DirectoryBusiness = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  country: string;
  tier: "local" | "boutique" | "stretch";
  website: string;
  instagram: string;
  address: string;
  contactEmail: string | null;
  contactPerson: string | null;
  contactWhere: string;
  description: string;
  outreachType: string;
  pitchTemplateId: string;
  whyYou: string;
  doToday: string;
  matchHint: string;
  opportunityScore: number;
  difficultyScore: number;
  valueScore: number;
  imageUrl: string;
};

export type PartnershipTier = 1 | 2 | 3;

export function directoryTierToNumber(tier: DirectoryBusiness["tier"]): PartnershipTier {
  if (tier === "local") return 1;
  if (tier === "boutique") return 2;
  return 3;
}

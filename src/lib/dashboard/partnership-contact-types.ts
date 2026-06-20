export type ContactConfidence = "verified" | "likely" | "unavailable";

export type ContactEmailEntry = {
  email: string;
  department: string;
  confidence: ContactConfidence;
};

export type PartnershipContactIntel = {
  website: { url: string; confidence: ContactConfidence } | null;
  instagram: { handle: string; confidence: ContactConfidence } | null;
  emails: ContactEmailEntry[];
  contactPerson: { name: string; title?: string; confidence: ContactConfidence } | null;
  phone: { number: string; confidence: ContactConfidence } | null;
  outreachGuidance: string;
};

export const UNAVAILABLE_LABEL = "Not Available";

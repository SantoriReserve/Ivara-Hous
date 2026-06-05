export type Service = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
};

export const SERVICES: Service[] = [
  {
    id: "creator-campaigns",
    title: "Creator Campaigns",
    shortDescription:
      "Project-based creator campaigns for luxury hotels, villas, resorts, and travel brands.",
    description:
      "Strategic, project-based creator campaigns designed for luxury hotels, villas, resorts, travel brands, and hospitality partners seeking elevated storytelling and measurable impact.",
    highlights: [
      "Luxury property activations",
      "Brand-aligned creator selection",
      "Campaign strategy & execution",
      "Premium content deliverables",
    ],
  },
  {
    id: "creator-partnership-management",
    title: "Creator Partnership Management",
    shortDescription:
      "Monthly management for properties seeking consistent creator collaborations and UGC.",
    description:
      "Ongoing monthly creator partnership management for luxury properties seeking consistent collaborations, UGC pipelines, campaign execution, and recurring content opportunities.",
    highlights: [
      "Monthly creator roster management",
      "UGC & content coordination",
      "Partnership pipeline development",
      "Performance reporting",
    ],
  },
  {
    id: "luxury-travel-coordination",
    title: "Luxury Travel Coordination",
    shortDescription:
      "Premium planning and execution for brand trips, creator travel, retreats, and luxury group experiences.",
    description:
      "Luxury Travel Coordination is designed for brand trips, creator trips, retreats, corporate travel experiences, luxury group travel, hosted experiences, and elevated travel planning. We coordinate logistics, accommodations, experiences, itineraries, travel planning, and trusted service providers when needed. We are not a 24/7 concierge or lifestyle management service. Our emphasis is on organization, coordination, planning, and the flawless execution of elevated travel experiences — delivered with the professionalism and discretion expected of a luxury travel agency.",
    highlights: [
      "Brand trips & creator trips",
      "Retreats & corporate travel experiences",
      "Luxury group travel & hosted experiences",
      "Elevated travel planning & itineraries",
      "Logistics, accommodations & trusted providers",
      "Not a 24/7 concierge or lifestyle management service",
    ],
  },
  {
    id: "hospitality-growth-partner",
    title: "Hospitality Growth Partner",
    shortDescription:
      "Premium partnership for properties seeking long-term hospitality growth.",
    description:
      "A premium partnership tier for luxury properties seeking creator collaborations, travel referrals, strategic introductions, and sustained growth through the Ivara Hous luxury travel platform.",
    highlights: [
      "Strategic introductions",
      "Creator collaboration access",
      "Travel referral network",
      "Long-term growth planning",
    ],
  },
  {
    id: "content-creative-partnerships",
    title: "Content & Creative Partnerships",
    shortDescription:
      "Connect properties with photographers, videographers, and production teams.",
    description:
      "Our creative partner roster connects luxury properties with photographers, videographers, production teams, editors, and creative professionals for world-class visual storytelling.",
    highlights: [
      "Vetted creative roster",
      "Production coordination",
      "Editorial & commercial content",
      "Brand-aligned creative matching",
    ],
  },
  {
    id: "creator-development",
    title: "Creator Development",
    shortDescription:
      "AI-powered system helping travel creators build professional, partnership-ready portfolios.",
    description:
      "An AI-powered creator development system helping aspiring travel creators build professional portfolios, strengthen positioning, and become partnership-ready within the luxury travel space.",
    highlights: [
      "Portfolio development",
      "Positioning & brand strategy",
      "Partnership readiness assessment",
      "40-day personalized development plan",
    ],
  },
];

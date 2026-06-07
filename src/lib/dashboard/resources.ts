import { fillContext } from "@/lib/dashboard/fill-context";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type DashboardResource = {
  id: string;
  title: string;
  category: string;
  description: string;
  items: string[];
  doToday: string;
};

const RESOURCE_DEFINITIONS: Array<{
  id: string;
  title: string;
  category: string;
  description: string;
  items: string[];
  doToday: string;
}> = [
  {
    id: "media-kit",
    title: "Media Kit Guidance",
    category: "Brand Assets",
    description: "What hospitality brands expect before they say yes to a hosted stay or paid campaign.",
    items: [
      "Opening line: your {positioning} in one sentence",
      "Audience snapshot: {followers} followers, top locations, engagement rate",
      "3 portfolio samples — one property, one dining, one {pillar} piece with real metrics",
      "Services: hosted stay, UGC, paid campaign — what you deliver for each",
      "Starting rates for {stage} creators (see Rate Card below)",
      "Contact: {name}, {instagram}, link to portfolio",
    ],
    doToday: "Open a Google Doc titled '{name} Media Kit'. Complete the bio and audience sections today — 30 minutes.",
  },
  {
    id: "outreach-tracker",
    title: "Outreach Tracker",
    category: "Systems",
    description: "One spreadsheet so no pitch falls through the cracks — this is how you get from 0 to 1 partnerships.",
    items: [
      "Columns: Business, Contact, Date sent, Pitch type, Status, Follow-up date, Notes",
      "Status flow: Sent → Opened → Replied → Call booked → Partnership confirmed",
      "Always log the content link you referenced in the pitch",
      "Schedule follow-up 5 days after every non-response",
      "Tag priority: local / dream brand / stretch target",
      "Weekly review: every Sunday, 3 next outreach actions",
    ],
    doToday: "Create the tracker in Notion or Google Sheets. Add your top 3 targets from Partnership Opportunities.",
  },
  {
    id: "partnership-tracker",
    title: "Partnership Tracker",
    category: "Systems",
    description: "Once someone says yes — track deliverables, dates, and payment so you look professional.",
    items: [
      "Partner name, deliverables agreed, due dates",
      "Contract signed? Payment terms? (50% upfront for paid work)",
      "Content approval workflow — who reviews, how many rounds",
      "Usage rights: how long can they use your content?",
      "Post-campaign recap: reach, saves, inbound DMs",
      "Renewal note: would you work with them again?",
    ],
    doToday: "You don't need this until your first 'yes' — but create the template now so you're ready.",
  },
  {
    id: "content-planning",
    title: "Content Planning Tools",
    category: "Content",
    description: "Plan posts that make brands want to work with you — not just posts that get likes.",
    items: [
      "Weekly rhythm: 2 feed posts + 1 reel + 3 story days",
      "Map posts to pillars: {pillar}, {pillar2}, {pillar3}",
      "Shot list for every property visit: arrival, room, detail, dining, view",
      "Caption bank with partnership CTAs — 'Available for collaborations'",
      "Batch day before {travel}: shoot 3 posts in one session",
      "Repurpose: 1 hotel visit → reel + carousel + 5 stories",
    ],
    doToday: "Pick one idea from Content Ideas. Block 60 minutes on your calendar this week to execute it.",
  },
  {
    id: "rate-card",
    title: "Rate Card Guidance",
    category: "Monetization",
    description: "Pricing clarity makes you look professional — brands take you seriously when you know your worth.",
    items: [
      "Hosted stay: deliverables, usage rights, exclusivity window",
      "UGC package: # of assets, revisions, turnaround time",
      "Paid campaign: posting + whitelisting + timeline",
      "Add-ons: extra reels, raw files, extended usage (30/60/90 days)",
      "{stage} starting ranges: adjust up as portfolio grows",
      "Payment: 50% upfront for paid work, net-14 recommended",
    ],
    doToday: "Draft 3 packages with deliverables only — no pricing yet if unsure. Pricing can come after your first inquiry.",
  },
  {
    id: "portfolio",
    title: "Portfolio-Building Resources",
    category: "Portfolio",
    description: "Proof that converts outreach into replies — brands need to see before they book you.",
    items: [
      "Case study #1: property or hotel (even if self-funded)",
      "Case study #2: restaurant or dining in {location}",
      "Before/after grid refresh screenshot for {instagram}",
      "60-second highlight reel of best {niche} work",
      "One-page PDF: bio, stats, 3 samples, services, contact",
      "Testimonial or quote if you have one — if not, use engagement metrics",
    ],
    doToday: "Address {gap} today: publish or polish one case study post from past travel content.",
  },
];

export function getDashboardResources(ctx: CreatorContext): DashboardResource[] {
  return RESOURCE_DEFINITIONS.map((resource) => ({
    id: resource.id,
    title: resource.title,
    category: resource.category,
    description: fillContext(ctx, resource.description),
    items: resource.items.map((item) => fillContext(ctx, item)),
    doToday: fillContext(ctx, resource.doToday),
  }));
}

/** @deprecated Use getDashboardResources(ctx) */
export const DASHBOARD_RESOURCES = RESOURCE_DEFINITIONS;

export type Service = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
};

export const SERVICES: Service[] = [
  {
    id: "creator-development",
    title: "Creator Development System",
    shortDescription:
      "AI-powered development for aspiring travel creators — assessment preview, 40-day action plan, and a personalized dashboard to become partnership-ready.",
    description:
      "An AI-powered creator development program for aspiring and emerging travel creators building professional portfolios, stronger positioning, and partnership readiness within luxury travel. Every plan is personalized to your current stage and long-term goals. Creators begin with a strategic assessment and receive a complimentary preview of their personalized evaluation. Those who continue can purchase the full Creator Development Assessment and receive a customized 40-day action plan. The program includes a personalized creator dashboard with content strategy, portfolio recommendations, outreach guidance, partnership resources, progress tracking, and daily action steps — culminating in stronger positioning, industry knowledge, outreach systems, and a roadmap for hosted stays, partnerships, and paid opportunities. Creators who feel ready may apply to join the Ivara Hous Creator Roster following completion.",
    highlights: [
      "Free personalized assessment preview",
      "Positioning & brand strategy",
      "Portfolio development recommendations",
      "40-day customized growth plan",
      "Personalized creator dashboard",
      "Outreach, pitching & partnership resources",
    ],
  },
  {
    id: "travel-creator-roster",
    title: "Travel Creator Roster",
    shortDescription:
      "Join the Ivara Hous creator roster for paid travel partnerships, hosted stays, and luxury campaigns — no fees, exclusivity, or contracts.",
    description:
      "Join the Ivara Hous Creator Roster and gain access to paid travel partnerships, hosted stays, luxury hospitality campaigns, and exclusive opportunities facilitated through our hospitality network. There are no membership fees, exclusivity requirements, contracts, or restrictions — creators remain fully independent and free to work with other brands and opportunities as they normally would. We only earn when creators earn through partnerships successfully facilitated by Ivara Hous. When opportunities arise, our team handles outreach, negotiations, communication, coordination, deliverables, and hospitality partner relationships. Creators receive campaign details, compensation, deliverable requirements, and expectations before deciding to participate. Once a partnership is completed, creators submit deliverables to our team and we handle final delivery with the hospitality partner.",
    highlights: [
      "No fees or exclusivity",
      "Paid travel campaign opportunities",
      "Hosted stay opportunities",
      "Partnership negotiation support",
      "Campaign coordination & management",
      "Independent creator freedom",
    ],
  },
  {
    id: "creator-partnership-management",
    title: "Creator Partnership Management",
    shortDescription:
      "Monthly retainer for luxury properties seeking creator partnerships — sourcing, coordination, campaigns, and deliverables handled end to end.",
    description:
      "A monthly retainer for luxury hotels, resorts, villas, tourism boards, and travel brands seeking ongoing access to professional travel creators without managing outreach internally. Properties gain access to the Ivara Hous travel creator roster. The Ivara Hous creator network extends beyond traditional travel influencers and includes photographers, videographers, production teams, media partners, content creators, and other creative professionals aligned with luxury hospitality and travel, while our team handles creator sourcing, communication, coordination, campaign management, deliverables, and relationship management. Rather than sorting through countless creator emails and stay requests, properties receive strategic creator recommendations aligned with their goals, audience, and brand positioning. Collaborations are selected campaign by campaign for complete flexibility each month. Creator compensation, hosted stays, and campaign expenses remain separate from the management retainer. Participating properties also receive increased visibility through the Ivara Hous ecosystem, creator network, website, social platforms, and luxury travel referral opportunities.",
    highlights: [
      "Monthly creator partnership management",
      "Curated creator & creative partner network access",
      "Creator communication & coordination",
      "UGC and content pipeline development",
      "Partnership strategy & reporting",
      "Ongoing visibility opportunities",
    ],
  },
  {
    id: "hospitality-growth-partner",
    title: "Hospitality Growth Partner",
    shortDescription:
      "Long-term growth partnership for luxury hospitality brands — creator management, strategic introductions, referrals, and business development.",
    description:
      "A premium partnership for luxury hospitality brands seeking a long-term growth partner rather than a traditional marketing service. This includes Creator Partnership Management alongside deeper strategic support, business development opportunities, referral pathways, creator collaborations, industry introductions, and access to the broader Ivara Hous luxury travel network. Hospitality Growth Partners become preferred partners within the Ivara ecosystem and may be recommended to travel clients, creator campaigns, luxury travelers, and aligned industry partners. Beyond creator partnerships, we help identify strategic growth opportunities including collaborations, retreats, wellness experiences, yacht partnerships, luxury experiences, and additional revenue-generating opportunities aligned with the property's goals. Every partnership is customized based on market position, objectives, and growth priorities.",
    highlights: [
      "Creator Partnership Management included",
      "Strategic introductions & partnerships",
      "Preferred partner network access",
      "Travel referral opportunities",
      "Business development support",
      "Long-term growth strategy",
    ],
  },
  {
    id: "luxury-travel-coordination",
    title: "Luxury Travel Coordination",
    shortDescription:
      "Premium planning and execution for brand trips, creator trips, retreats, corporate travel, and luxury group experiences.",
    description:
      "Luxury Travel Coordination is designed for brand trips, creator trips, retreats, corporate travel experiences, luxury group travel, hosted experiences, and elevated travel planning. We coordinate logistics, accommodations, experiences, itineraries, travel planning, and trusted service providers when needed. We are not a 24/7 concierge or lifestyle management service. Our emphasis is on organization, coordination, planning, and the flawless execution of elevated travel experiences — delivered with the professionalism and discretion expected of a luxury travel agency.",
    highlights: [
      "Brand trips & creator trips",
      "Retreats & corporate travel experiences",
      "Luxury group travel & hosted experiences",
      "Elevated travel planning & itineraries",
      "Logistics, accommodations & trusted providers",
    ],
  },
  {
    id: "content-creative-partnerships",
    title: "Content & Creative Partnerships",
    shortDescription:
      "Connect luxury properties with photographers, videographers, production teams, and creative professionals for world-class visual storytelling.",
    description:
      "Our creative partner roster connects luxury properties with photographers, videographers, production teams, editors, and creative professionals for world-class visual storytelling. Whether a property needs a full campaign, editorial imagery, social media content, video production, or ongoing creative support, we facilitate introductions and coordinate the right creative talent for the project.",
    highlights: [
      "Vetted creative roster",
      "Production coordination",
      "Editorial & commercial content",
      "Brand-aligned creative matching",
    ],
  },
];

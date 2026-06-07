import { fillContext } from "@/lib/dashboard/fill-context";
import type { CreatorContext } from "@/lib/plan/plan-generation-context";

export type PitchTemplate = {
  id: string;
  title: string;
  description: string;
  subject?: string;
  body: string;
  personalizeBeforeSending: string;
  sendToday: string;
  tags: string[];
};

const TEMPLATE_DEFINITIONS: Array<{
  id: string;
  title: string;
  description: string;
  subject?: string;
  body: string;
  personalizeBeforeSending: string;
  sendToday: string;
  tags: string[];
}> = [
  {
    id: "hosted-stay",
    title: "Hosted Stay Pitch",
    description: "Position a content collaboration that helps a property attract the right guests.",
    subject: "Content collaboration — {niche} storytelling for your property",
    body: `Hi there,

I have been following your property, and the guest experience you have built is exactly the kind of stay my audience plans around.

I am {name}, a {niche} creator ({instagram}, {followers} followers) based in {location}. I create {pillar} content that helps hospitality brands tell stronger stories and reach travelers who book {tier} experiences.

For a hosted collaboration around {travel}, I would deliver:
• One cinematic reel (30–45 seconds) from arrival through the full stay
• One carousel with five practical guest takeaways your team can repost
• Story coverage during the visit
• Ninety-day usage rights for your channels

My content is designed to drive qualified interest, not just impressions. I am happy to share audience insights and relevant examples.

Would you be open to a brief call this week to discuss dates and creative direction?

Warm regards,
{name}
{instagram}`,
    personalizeBeforeSending:
      "Add the property name in the subject and opening line. Reference one specific detail from their Instagram: a suite, terrace, dining room, or neighborhood angle.",
    sendToday:
      "Choose one target from Partnership Opportunities. Personalize the opening line and send before 4 p.m. local time.",
    tags: ["hosted stay", "hotel", "hospitality"],
  },
  {
    id: "restaurant",
    title: "Restaurant Collaboration Pitch",
    description: "Pitch a dining feature that gives the restaurant usable content and you portfolio proof.",
    subject: "Dining feature collaboration — {niche} creator in {location}",
    body: `Hi there,

I am {name}, a {niche} creator in {location} ({instagram}), and I would like to feature your restaurant for an audience that actively books elevated dining experiences.

From one visit, I would deliver:
• One reel capturing ambiance, plating, and service moments
• One carousel with five dishes I would recommend ordering
• Story coverage the evening of the visit

Your restaurant aligns with the {tier} experiences my followers expect. I am planning content around {travel} and strong local features in {location}, and this would be a natural fit.

I am open to a hosted tasting or a paid collaboration, depending on what works best for your team. Either way, you receive content your marketing team can use immediately.

Would next week work for a short conversation?

Thank you,
{name}`,
    personalizeBeforeSending:
      "Name the restaurant and reference one dish, chef, or design detail from their recent posts.",
    sendToday:
      "DM the restaurant account if no email is listed. Send tonight after reviewing their three most recent posts.",
    tags: ["restaurant", "dining", "local"],
  },
  {
    id: "boutique-hotel",
    title: "Boutique Hotel Pitch",
    description: "A concise, warm note for independent hotels — professional and easy to reply to.",
    subject: "Creator stay collaboration — {niche} content",
    body: `Hello,

I am {name}, and I create {pillar} content for a {followers} audience who trust my recommendations for {tier} stays ({instagram}).

Your property stands out for its design and guest experience. That is exactly the type of boutique stay my community saves and books.

If you are open to a hosted collaboration, I would propose:
• Two nights around {travel}, flexible on dates
• One cinematic reel and one photo-led carousel
• A short neighborhood guide in stories

I focus on long-term hospitality partnerships that support both storytelling and bookings. If timing is not right, I would still appreciate staying on your radar for future creator visits.

May I send my media kit?

Warmly,
{name}`,
    personalizeBeforeSending:
      "Name the hotel and mention one room, rooftop, or lobby detail from their feed.",
    sendToday:
      "Use for your top local boutique target. Send via Instagram DM if no email is listed.",
    tags: ["boutique", "hotel", "design"],
  },
  {
    id: "luxury-villa",
    title: "Luxury Villa Pitch",
    description: "For villa stays, retreats, and private properties where cinematic storytelling matters.",
    subject: "Villa content concept — {niche} creator partnership",
    body: `Hi there,

I am {name}, a {niche} creator ({instagram}, {followers} followers) specializing in {pillar} storytelling for luxury travel audiences.

Private villas and retreat properties are some of the strongest content environments for my audience because they combine design, privacy, and experience in one narrative.

For a collaboration around {travel}, I would create:
• One cinematic villa tour reel with arrival, interiors, and outdoor living spaces
• One carousel documenting the full guest experience
• Story coverage across the stay
• A case study your team can use for future bookings

My goal is to produce content that helps properties like yours attract high-intent guests, not just social engagement.

I would welcome the opportunity to share concepts and availability for {travel}.

Best regards,
{name}`,
    personalizeBeforeSending:
      "Name the villa or property. Reference the pool, view, architecture, or retreat programming from their website or Instagram.",
    sendToday:
      "Best for villa and retreat targets in Partnership Opportunities. Email with a one-line concept in the subject.",
    tags: ["villa", "retreat", "luxury"],
  },
  {
    id: "paid-ugc",
    title: "Paid UGC Pitch",
    description: "Offer platform-ready assets for the brand's channels — you create, they publish.",
    subject: "UGC content for {niche} hospitality brands — {name}",
    body: `Hi there,

I am {name}, a {niche} content creator ({instagram}, {followers} followers) who produces UGC for hospitality and travel brands.

Rather than focusing on a public post to my audience, I create assets your team can run across paid ads, your website, and social:
• Three hook-led vertical reels (9:16) aligned with your brand voice
• Fifteen edited photos in a consistent luxury tone
• Two revision rounds included
• Delivery within thirty days of brief approval

My style is {style}, centered on {pillar}, and built to convert for {tier} travel audiences.

I would be glad to send samples, turnaround times, and a rate overview today.

Best,
{name}`,
    personalizeBeforeSending:
      "Name the brand. Mention one specific ad, reel, or campaign style you noticed on their channels.",
    sendToday:
      "Send to brands with active paid social or a partnerships page on their website.",
    tags: ["UGC", "paid", "content"],
  },
  {
    id: "follow-up",
    title: "Follow-Up Pitch",
    description: "One week after your first note — confident, brief, still offering value.",
    subject: "Following up — collaboration with {name}",
    body: `Hi there,

I wanted to follow up on my note from last week about a potential collaboration.

Since then, I published new {niche} content on {instagram} that aligns well with your property. I am happy to share the link if it would be helpful for context.

I remain interested in exploring a partnership and have availability around {travel}. If a hosted stay, paid UGC, or content campaign would be useful for your team, I would welcome a brief conversation.

If the timing is not right, I completely understand. I would appreciate being kept in mind for future opportunities.

Thank you again,
{name}
{instagram}`,
    personalizeBeforeSending:
      "Add the date of your first message and link your latest post in the second sentence.",
    sendToday:
      "Send to every contact who has not replied within five to seven days. Log it in your outreach tracker.",
    tags: ["follow-up", "outreach"],
  },
  {
    id: "no-response-follow-up",
    title: "No-Response Follow-Up",
    description: "Final touch after two attempts — graceful, professional, leaves the door open.",
    subject: "Quick follow-up — {name}",
    body: `Hi there,

I know inboxes get busy, so I wanted to send one final note in case my earlier messages about a collaboration were missed.

I create {pillar} content for {followers} followers who book {tier} travel experiences, and I believe there is a strong fit between your property and my audience.

If a partnership is not the right fit right now, no problem at all. If it might be relevant later, I would be glad to stay connected and share my media kit when useful.

Thank you for your time,
{name}
{instagram}`,
    personalizeBeforeSending:
      "Only use after two prior outreach attempts. Keep it under six sentences.",
    sendToday:
      "Send only to contacts with two logged attempts and no reply. Then mark as paused in your tracker.",
    tags: ["follow-up", "final touch"],
  },
  {
    id: "partnership-thank-you",
    title: "Partnership Thank-You",
    description: "After a positive reply, meeting, or collaboration — builds long-term relationships.",
    subject: "Thank you — excited to collaborate",
    body: `Hi there,

Thank you for taking the time to discuss a potential collaboration. I appreciated learning more about your property and the experience you are building for guests.

I am excited about the opportunity to create content that reflects the quality of your brand and resonates with my audience. As discussed, I will follow up with my media kit, content concepts, and proposed timeline.

Please let me know if there is anything else you need from my side to move forward.

Looking forward to working together,
{name}
{instagram}`,
    personalizeBeforeSending:
      "Reference one specific point from your conversation or their reply. Attach media kit if you have not already.",
    sendToday:
      "Send within twenty-four hours of a positive reply or call. Sets a professional tone for the partnership.",
    tags: ["thank you", "relationship", "partnership"],
  },
];

export function getPitchTemplates(ctx: CreatorContext): PitchTemplate[] {
  return TEMPLATE_DEFINITIONS.map((template) => ({
    id: template.id,
    title: template.title,
    description: template.description,
    subject: template.subject ? fillContext(ctx, template.subject) : undefined,
    body: fillContext(ctx, template.body),
    personalizeBeforeSending: fillContext(ctx, template.personalizeBeforeSending),
    sendToday: fillContext(ctx, template.sendToday),
    tags: template.tags,
  }));
}

export const PITCH_TEMPLATE_TITLES: Record<string, string> = Object.fromEntries(
  TEMPLATE_DEFINITIONS.map((t) => [t.id, t.title])
);

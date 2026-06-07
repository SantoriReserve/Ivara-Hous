import type { ContentIdeaFormat, ContentIdeaFramework } from "@/lib/dashboard/content-ideas-library";

type Theme = {
  id: string;
  label: string;
  niches?: string[];
  stages?: string[];
};

type Angle = {
  id: string;
  format: ContentIdeaFormat;
  title: string;
  deliverable: string;
  description: string;
  hook: string;
  callToAction: string;
  shotList: string[];
  outreachUse: string;
  estimatedTime: string;
};

const THEMES: Theme[] = [
  { id: "hospitality", label: "Hospitality", niches: ["travel", "hospitality", "hotel"] },
  { id: "luxury-travel", label: "Luxury Travel", niches: ["travel", "luxury"] },
  { id: "dining", label: "Dining", niches: ["food", "dining", "restaurant"] },
  { id: "fashion-travel", label: "Fashion-Meets-Travel", niches: ["fashion", "travel", "lifestyle"] },
  { id: "personal-brand", label: "Personal Brand", stages: ["growing", "established"] },
  { id: "educational", label: "Educational", stages: ["emerging", "growing"] },
  { id: "authority", label: "Authority-Building", stages: ["growing", "established"] },
  { id: "ugc", label: "UGC", niches: ["ugc", "content"] },
  { id: "boutique-hotels", label: "Boutique Hotels", niches: ["hotel", "boutique"] },
  { id: "resort", label: "Resort & Villa", niches: ["travel", "villa", "resort"] },
  { id: "city-guide", label: "City Guide", niches: ["travel", "city"] },
  { id: "wellness", label: "Wellness Travel", niches: ["wellness", "spa", "travel"] },
  { id: "creator-ops", label: "Creator Operations", stages: ["emerging", "growing"] },
];

const ANGLES: Angle[] = [
  {
    id: "proof-reel",
    format: "Reel",
    title: "{theme} Proof Reel",
    deliverable: "1 vertical reel (9:16), 25–45 sec on {instagram}",
    description: "Arrival → hero detail → experience moment. Text on screen, luxury pacing.",
    hook: "The kind of {theme} content brands save for partnerships",
    callToAction: "Partnership inquiries — link in bio",
    shotList: ["Opening hook in 2 sec", "3 hero shots with text overlays", "End card with geotag and CTA"],
    outreachUse: "Attach as proof in your next {tier} hospitality pitch.",
    estimatedTime: "60 min",
  },
  {
    id: "pov-arrival",
    format: "Reel",
    title: "POV: {theme} First Impression",
    deliverable: "1 reel under 20 sec, local business tagged in {location}",
    description: "Walk-in energy — works at hotels, restaurants, cafés, and experiences.",
    hook: "POV: You just walked into the kind of place your audience saves",
    callToAction: "Save this for {location}",
    shotList: ["Door or entrance — 3 sec", "Hands-on detail — menu, key, plate", "Geotag and tag the business"],
    outreachUse: "Tag the business, then pitch next day with Boutique Hotel or Restaurant template.",
    estimatedTime: "45 min",
  },
  {
    id: "tiktok-trend",
    format: "TikTok",
    title: "{theme} Trend Adaptation",
    deliverable: "1 TikTok under 30 sec using a current audio trend",
    description: "Reframe a trending sound through {theme} — shows you understand platform culture.",
    hook: "When the trend meets {tier} hospitality",
    callToAction: "Follow for more {niche} travel",
    shotList: ["Match trend timing to property or dining beats", "On-screen hook in first second", "Caption with location + niche keywords"],
    outreachUse: "Brands want creators who translate trends — include TikTok link in UGC pitches.",
    estimatedTime: "40 min",
  },
  {
    id: "carousel-standards",
    format: "Carousel",
    title: "5 Signs a {theme} Brand Is Worth Partnering With",
    deliverable: "1 carousel, 7 slides, posted Tuesday or Thursday",
    description: "Positions you as selective — hospitality brands want creators with standards.",
    hook: "After years of {niche} content, I only recommend brands that pass these 5 tests",
    callToAction: "Which standard matters most? Comment 1–5",
    shotList: ["Slide 1: hook + hero photo", "Slides 2–6: one standard each", "Slide 7: portfolio CTA in bio"],
    outreachUse: "Hotels see you as a curator — include this post when pitching hosted stays.",
    estimatedTime: "75 min",
  },
  {
    id: "carousel-case-study",
    format: "Carousel",
    title: "{theme} Case Study Carousel",
    deliverable: "1 carousel documenting a recent stay or dining feature",
    description: "Before/after, metrics, and deliverables — attach to outreach this week.",
    hook: "What I delivered for a {tier} property in one weekend",
    callToAction: "DM for partnership deck",
    shotList: ["Slide 1: property hero", "Slides 2–4: deliverables created", "Slide 5: results or engagement", "Slide 6: your process"],
    outreachUse: "Lead pitch emails with this carousel as social proof.",
    estimatedTime: "90 min",
  },
  {
    id: "story-sequence",
    format: "Story Series",
    title: "5-Frame {theme} Story Sequence",
    deliverable: "5 connected story frames with poll and link sticker",
    description: "Interactive story arc — strong engagement signal for brands reviewing your profile.",
    hook: "5 details that make this {theme} experience feel {tier}",
    callToAction: "Poll: Which detail matters most?",
    shotList: ["Frame 1: text hook", "Frames 2–4: one detail each", "Frame 5: poll + link sticker"],
    outreachUse: "Screenshot story insights for your media kit metrics slide.",
    estimatedTime: "30 min",
  },
  {
    id: "ugc-vertical",
    format: "UGC",
    title: "{theme} UGC Vertical Clips",
    deliverable: "3–5 raw vertical clips (9:16) for brand ad use",
    description: "Platform-ready clips a brand can run without requiring a public post.",
    hook: "B-roll brands can run as paid ads",
    callToAction: "UGC inquiries — link in bio",
    shotList: ["Room or plate detail — 5 sec", "Lifestyle moment — 5 sec", "Wide establishing — 5 sec", "Export without watermark"],
    outreachUse: "Pitch UGC packages to restaurants and boutique hotels with clip samples.",
    estimatedTime: "2 hours",
  },
  {
    id: "talking-head-tip",
    format: "Talking-head",
    title: "{theme} Authority Tip",
    deliverable: "1 talking-head reel, 30–45 sec, direct to camera",
    description: "Share one non-obvious insight — builds trust with hospitality decision-makers.",
    hook: "One thing most creators get wrong about {theme} partnerships",
    callToAction: "Save this before your next pitch",
    shotList: ["Hook in first 3 sec on camera", "3 bullet points with b-roll cutaways", "CTA to media kit or portfolio"],
    outreachUse: "DM this to marketing managers after an initial pitch — shows expertise.",
    estimatedTime: "45 min",
  },
  {
    id: "photo-editorial",
    format: "Photo",
    title: "{theme} Editorial Photo Set",
    deliverable: "5–8 feed photos with cohesive color grade",
    description: "Magazine-quality stills for grid refresh or media kit hero images.",
    hook: "Editorial frames that make brands stop scrolling",
    callToAction: "Portfolio in bio",
    shotList: ["Wide establishing shot", "Detail macro — texture, light, design", "Lifestyle portrait if on-camera", "Consistent grade across set"],
    outreachUse: "Attach best 3 frames to hosted stay pitch as style reference.",
    estimatedTime: "90 min",
  },
  {
    id: "review-honest",
    format: "Review",
    title: "Honest {theme} Review",
    deliverable: "1 reel or carousel with balanced praise and constructive notes",
    description: "Honest reviews build credibility — brands respect creators who have standards.",
    hook: "Would I partner with this {theme} brand again? Here's my honest take",
    callToAction: "Comment if you've stayed or dined here",
    shotList: ["What exceeded expectations", "One area for improvement", "Who this is perfect for", "Final verdict"],
    outreachUse: "Shows editorial integrity — reference when pitching similar-tier properties.",
    estimatedTime: "60 min",
  },
  {
    id: "educational-howto",
    format: "Educational",
    title: "How to Pitch {theme} Brands",
    deliverable: "1 carousel or reel teaching your outreach framework",
    description: "Educational content that positions you as a hospitality creator expert.",
    hook: "The exact pitch structure that got me my last {tier} partnership",
    callToAction: "Save for your next outreach week",
    shotList: ["Hook: results-first", "Step 1: research", "Step 2: personalization", "Step 3: deliverable offer", "CTA: free resources in bio"],
    outreachUse: "Attract inbound brand interest — tag relevant tourism or hotel accounts.",
    estimatedTime: "75 min",
  },
  {
    id: "campaign-mini",
    format: "Campaign",
    title: "{theme} Mini Campaign",
    deliverable: "3 posts across feed + stories over 48 hours",
    description: "Simulates a brand campaign — shows you can execute multi-touch content.",
    hook: "What a 48-hour {theme} content sprint looks like",
    callToAction: "Partnership packages in bio",
    shotList: ["Post 1: arrival reel", "Post 2: detail carousel", "Stories: behind-the-scenes", "End: results recap"],
    outreachUse: "Present as a sample campaign structure in paid partnership proposals.",
    estimatedTime: "3 hours",
  },
];

function fillTheme(template: string, theme: Theme): string {
  return template.replace(/\{theme\}/g, theme.label);
}

export function generateExpandedContentIdeas(): ContentIdeaFramework[] {
  const ideas: ContentIdeaFramework[] = [];

  for (const theme of THEMES) {
    for (const angle of ANGLES) {
      const id = `${theme.id}-${angle.id}`;
      ideas.push({
        id,
        format: angle.format,
        title: fillTheme(angle.title, theme),
        deliverable: fillTheme(angle.deliverable, theme),
        description: fillTheme(angle.description, theme),
        hook: fillTheme(angle.hook, theme),
        callToAction: fillTheme(angle.callToAction, theme),
        shotList: angle.shotList.map((s) => fillTheme(s, theme)),
        outreachUse: fillTheme(angle.outreachUse, theme),
        estimatedTime: angle.estimatedTime,
        // Expanded library is available to all creators — personalization via fillContext only
      });
    }
  }

  return ideas;
}

import type { CreatorContext, PlanGenerationInput } from "@/lib/plan/plan-generation-context";
import { weekNumberForDay } from "@/lib/plan/plan-constants";
import type {
  PlanBlueprint,
  PlanDayTasksBatch,
  PlanWeeksOutput,
  PlanSummary,
} from "@/lib/plan/plan-schema";
import type { FocusArea, TaskType } from "@/lib/plan/plan-constants";

type DayTheme = FocusArea | "review" | "reflect";

type DayFramework = {
  title: string;
  objective: string;
  theme: DayTheme;
  estimatedMinutes: number;
};

function themeToFocusArea(theme: DayTheme): FocusArea {
  if (theme === "review" || theme === "reflect") return "skills";
  return theme;
}

const DAY_FRAMEWORK: DayFramework[] = [
  { title: "Portfolio audit for {dream} partnerships", objective: "Audit {instagram} against what {tier} hospitality brands expect from {archetype} creators — note gaps in {gap}", theme: "portfolio", estimatedMinutes: 60 },
  { title: "Grid optimization for brand first impressions", objective: "Reorder your top 9 posts so a hotel GM immediately sees {pillar} and {tier} quality", theme: "portfolio", estimatedMinutes: 55 },
  { title: "Media kit draft for {name}", objective: "Build your first media kit draft with {positioning}, {followers} stats, and 3 {niche} samples", theme: "brand", estimatedMinutes: 75 },
  { title: "Positioning: {archetype} value statement", objective: "Write a 3-sentence pitch: who you are, who you serve, why {dream} brands should care", theme: "positioning", estimatedMinutes: 45 },
  { title: "Case study post from past {niche} content", objective: "Publish one carousel proving you can deliver partnership-ready storytelling for {goal}", theme: "content", estimatedMinutes: 90 },
  { title: "Profile upgrade for partnership inquiries", objective: "Update {instagram} bio and link-in-bio so brands know you're open for {tier} collaborations", theme: "brand", estimatedMinutes: 50 },
  { title: "Week 1: finalize outreach target list", objective: "Add 10 {dream} properties to your tracker from Partnership Opportunities — names, contacts, pitch type", theme: "review", estimatedMinutes: 40 },
  { title: "Reel concept & shoot", objective: "Create one luxury travel reel with a clear hook", theme: "content", estimatedMinutes: 85 },
  { title: "Carousel storytelling post", objective: "Publish an educational carousel for your ideal partner", theme: "content", estimatedMinutes: 70 },
  { title: "Photo series planning", objective: "Plan a 5-image series for boutique hospitality brands", theme: "content", estimatedMinutes: 55 },
  { title: "Story sequence launch", objective: "Run a 3-part story series demonstrating travel expertise", theme: "content", estimatedMinutes: 45 },
  { title: "Content batch session", objective: "Batch captions and hooks for upcoming posts", theme: "content", estimatedMinutes: 65 },
  { title: "Brand voice refinement", objective: "Align captions with luxury partnership tone", theme: "brand", estimatedMinutes: 50 },
  { title: "Week 2: publish + prep pitches", objective: "Post one Content Ideas assignment and attach it to 2 draft pitches in Pitch Templates", theme: "review", estimatedMinutes: 40 },
  { title: "Build your 15-target outreach list", objective: "Pull targets from Partnership Opportunities and add 5 local {location} properties aligned with {dream}", theme: "outreach", estimatedMinutes: 60 },
  { title: "Personalize your Hosted Stay Pitch", objective: "Customize the pitch template for your #1 target — reference something specific from their Instagram", theme: "outreach", estimatedMinutes: 55 },
  { title: "Send 5 boutique hotel pitches", objective: "Send 5 personalized messages to boutique hotels matching {tier} and {travel} plans", theme: "outreach", estimatedMinutes: 75 },
  { title: "Restaurant partnership outreach", objective: "Pitch 3 restaurants for content collaboration", theme: "outreach", estimatedMinutes: 65 },
  { title: "Follow-up sequence", objective: "Send follow-ups to non-responders from prior outreach", theme: "outreach", estimatedMinutes: 45 },
  { title: "Partnership tracker setup", objective: "Log all outreach in your partnership tracker", theme: "partnerships", estimatedMinutes: 40 },
  { title: "Week 3: send follow-ups", objective: "Follow up with every non-responder from outreach week using the Follow-Up template", theme: "review", estimatedMinutes: 45 },
  { title: "UGC campaign pitch", objective: "Draft a paid UGC pitch for a hospitality brand", theme: "partnerships", estimatedMinutes: 60 },
  { title: "Resort collaboration proposal", objective: "Create a resort partnership one-sheet", theme: "partnerships", estimatedMinutes: 80 },
  { title: "Villa experience concept", objective: "Pitch a villa stay content concept to 3 targets", theme: "partnerships", estimatedMinutes: 70 },
  { title: "Experience brand outreach", objective: "Reach out to 4 experience-led hospitality brands", theme: "outreach", estimatedMinutes: 65 },
  { title: "Rate card draft", objective: "Build a simple rate card for partnership packages", theme: "brand", estimatedMinutes: 55 },
  { title: "Partnership call prep", objective: "Prepare talking points for partnership conversations", theme: "partnerships", estimatedMinutes: 50 },
  { title: "Week 4: close warm leads", objective: "Send proposals to every contact who replied — attach media kit and one content sample", theme: "review", estimatedMinutes: 45 },
  { title: "Audience engagement sprint", objective: "Execute engagement actions that attract brand attention", theme: "audience", estimatedMinutes: 50 },
  { title: "Portfolio case study #2", objective: "Publish a second high-quality partnership case study", theme: "portfolio", estimatedMinutes: 90 },
  { title: "Content campaign launch", objective: "Launch a 3-post mini campaign for your niche", theme: "content", estimatedMinutes: 85 },
  { title: "Hospitality brand DM outreach", objective: "Send 5 targeted Instagram DMs to hospitality brands", theme: "outreach", estimatedMinutes: 55 },
  { title: "Media kit polish", objective: "Finalize media kit with stats, rates, and examples", theme: "brand", estimatedMinutes: 70 },
  { title: "Skills upgrade session", objective: "Improve one technical skill that elevates content quality", theme: "skills", estimatedMinutes: 60 },
  { title: "Week 5: DM outreach wave", objective: "Send 5 Instagram DMs to hospitality brands using your best-performing post as proof", theme: "review", estimatedMinutes: 40 },
  { title: "Partnership proposal package", objective: "Assemble a complete partnership proposal PDF", theme: "partnerships", estimatedMinutes: 85 },
  { title: "Final outreach wave", objective: "Send 8 high-priority outreach messages", theme: "outreach", estimatedMinutes: 80 },
  { title: "Launch-ready content", objective: "Publish launch content announcing partnership readiness", theme: "content", estimatedMinutes: 75 },
  { title: "Pipeline consolidation", objective: "Organize all active leads and next actions", theme: "partnerships", estimatedMinutes: 50 },
  { title: "Day 40: next 30-day outreach calendar", objective: "Name 10 targets, 8 content posts, and 3 proposals for your next 30 days — all dated", theme: "reflect", estimatedMinutes: 55 },
];

const WEEK_FRAMEWORK = [
  { title: "Foundation & Portfolio", milestone: "Your {instagram} and media kit signal {tier} partnership readiness", successCriteria: "Media kit draft live, grid optimized, {positioning} clear in bio" },
  { title: "Content Engine", milestone: "Published proof that you deliver {pillar} content brands can use", successCriteria: "Reel + carousel live with partnership CTA — attachable to pitches" },
  { title: "Outreach Systems", milestone: "15 {dream} targets contacted with personalized pitches", successCriteria: "Outreach tracker active, 15+ messages sent, follow-ups scheduled" },
  { title: "Partnership Pipeline", milestone: "Warm partnership conversations and proposals in motion", successCriteria: "UGC/resort/villa pitches sent with rate card ready" },
  { title: "Brand Acceleration", milestone: "Elevated brand presence and audience engagement", successCriteria: "Media kit polished, campaign live, DMs sent" },
  { title: "Launch & Scale", milestone: "Partnership-ready creator operating system in place", successCriteria: "Proposal package complete, pipeline organized, next 30 days planned" },
];

function p(ctx: CreatorContext, template: string): string {
  return template
    .replace(/\{name\}/g, ctx.fullName)
    .replace(/\{niche\}/g, ctx.niche)
    .replace(/\{location\}/g, ctx.location)
    .replace(/\{instagram\}/g, ctx.instagram || "your Instagram")
    .replace(/\{followers\}/g, ctx.followerCount)
    .replace(/\{goal\}/g, ctx.primaryGoal)
    .replace(/\{dream\}/g, ctx.dreamPartnerships)
    .replace(/\{challenge\}/g, ctx.biggestChallenge)
    .replace(/\{stage\}/g, ctx.stage)
    .replace(/\{archetype\}/g, ctx.archetype)
    .replace(/\{tier\}/g, ctx.tier)
    .replace(/\{travel\}/g, ctx.upcomingTravel || "your next trip")
    .replace(/\{pillar\}/g, ctx.contentPillars[0] ?? ctx.niche)
    .replace(/\{pillar2\}/g, ctx.contentPillars[1] ?? ctx.niche)
    .replace(/\{gap\}/g, ctx.portfolioGaps[0] ?? "partnership proof")
    .replace(/\{positioning\}/g, ctx.positioningStatement)
    .replace(/\{style\}/g, ctx.contentStyle)
    .replace(/\{priority\}/g, ctx.priorityFocusAreas[0] ?? "outreach");
}

function buildTasksForDay(dayNumber: number, framework: DayFramework, ctx: CreatorContext) {
  const focus = framework.theme;
  const tasks: Array<{
    taskType: TaskType;
    title: string;
    instruction: string;
    deliverable: string;
    successCriteria: string;
    isRequired: boolean;
  }> = [];

  const add = (
    taskType: TaskType,
    title: string,
    instruction: string,
    deliverable: string,
    successCriteria: string,
    isRequired: boolean
  ) => {
    tasks.push({
      taskType,
      title: p(ctx, title),
      instruction: p(ctx, instruction),
      deliverable: p(ctx, deliverable),
      successCriteria: p(ctx, successCriteria),
      isRequired,
    });
  };

  switch (focus) {
    case "portfolio":
      add("action", "Execute: {niche} portfolio upgrade", "Open {instagram} and select 9 posts that best represent {tier} partnerships. Replace or archive 3 weak posts. Screenshot before/after grid for your portfolio folder.", "Updated 3x3 grid screenshot + notes", "Grid clearly signals {niche} luxury positioning", true);
      add("create", "Publish: portfolio case study post", "Create one carousel documenting a past travel experience relevant to {dream}. Include hook, story, takeaway, and CTA for hospitality brands.", "1 published carousel or reel", "Post is live with partnership-ready caption", true);
      add("action", "Optimize: profile & link in bio", "Update {instagram} bio and link-in-bio to reflect {tier} partnerships. Add portfolio or media kit link.", "Updated profile screenshots", "Bio clearly states {goal} and partnership availability", true);
      break;
    case "content":
      add("create", "Shoot: {pillar} content asset", "Film or photograph content for {pillar} focused on {travel}. Capture 15+ usable clips/photos with luxury framing.", "Raw content folder for today", "15+ assets saved and labeled", true);
      add("action", "Post: scheduled luxury content", "Write caption with brand voice for {archetype} creators. Publish reel, carousel, or photo set today on {instagram}.", "1 live post", "Post published with CTA relevant to {goal}", true);
      add("create", "Draft: story series outline", "Outline a 3-part story series showcasing {niche} expertise. Write hooks and CTAs for each frame.", "Story series script", "Script ready to film and publish this week", false);
      break;
    case "outreach":
      add("action", "Send: boutique hotel outreach", "Open Partnership Opportunities. Pick 3 targets aligned with {dream}. Send each a personalized Hosted Stay Pitch — mention one detail from their recent Instagram post and your {followers} audience.", "3 outreach emails or DMs sent", "Each logged in tracker with property name, date, and follow-up date", true);
      add("action", "Send: restaurant partnership DM", "DM 2 restaurants in {location} using the Restaurant Partnership Pitch. Propose: 1 reel + story coverage in exchange for a hosted tasting.", "2 DMs sent with screenshots saved", "Messages reference a specific menu item or room detail from their feed", true);
      add("action", "Send: hospitality brand follow-up", "Follow up with 2 contacts who haven't replied in 5+ days. Use the Follow-Up template and link your latest {pillar} post.", "2 follow-up messages sent", "Follow-ups logged — if no reply after 2nd touch, mark as 'paused' and move on", true);
      break;
    case "partnerships":
      add("create", "Draft: paid campaign pitch", "Write a UGC/paid campaign pitch for one {tier} target. Include deliverables, timeline, and audience stats for {name}.", "1 pitch document", "Pitch ready to send with personalized intro", true);
      add("action", "Send: partnership proposal", "Email or DM one warm lead with your proposal package and 3 content concepts for their property.", "1 proposal sent", "Proposal logged with expected follow-up date", true);
      add("create", "Build: partnership one-sheet", "Create a one-page PDF with your rates, audience stats, sample work, and 3 collaboration concepts for {dream} partners.", "Partnership one-sheet PDF", "PDF exported and ready to attach to outreach", true);
      break;
    case "brand":
    case "positioning":
      add("create", "Build: media kit section", "Add audience stats, {niche} positioning, sample work, and services to your media kit. Export as PDF.", "Media kit PDF section", "PDF includes bio, stats, 3 samples, and services list", true);
      add("action", "Optimize: profile & link in bio", "Update {instagram} bio, link-in-bio, and TikTok to reflect {tier} partnerships. Add media kit link.", "Updated profile screenshots", "Bio clearly states {goal} and partnership availability", true);
      add("create", "Draft: rate card", "Create a simple rate card with hosted stay, UGC, and paid campaign packages tailored to {stage} creators in {niche}.", "Rate card document", "Rate card includes 3 packages with deliverables", true);
      break;
    case "audience":
      add("action", "Execute: engagement campaign", "Leave 20 thoughtful comments on {tier} brand and creator accounts. DM 3 creators in {niche} for community building.", "Engagement log", "20 comments + 3 DMs completed today", true);
      add("action", "Post: value-driven content", "Publish one post designed to attract brand attention — educational, behind-the-scenes, or destination-led for {pillar}.", "1 published post", "Post includes clear partnership CTA", true);
      break;
    case "skills":
      add("action", "Complete: editing upgrade session", "Spend 45 minutes improving one editing skill (color grade, transitions, or hooks) on a {niche} clip.", "1 improved video clip", "Exported clip shows visible quality improvement", true);
      add("create", "Build: content workflow checklist", "Document your shoot-to-post workflow for {niche} content. Include equipment, editing apps, and posting schedule.", "Workflow checklist", "Checklist saved for repeatable use", true);
      break;
    case "review":
      add("action", "Send: 2 priority outreach messages", "Open Partnership Opportunities. Send 2 messages to top-priority {dream} targets using the matching pitch template. Link your best {pillar} post.", "2 outreach messages sent and logged", "Tracker updated with contact, date, template used, follow-up date", true);
      add("action", "Complete: follow-up sweep", "Follow up with every contact from prior weeks who hasn't replied. Use Follow-Up template with your latest post linked.", "All pending follow-ups sent", "No outreach older than 7 days without a follow-up", true);
      add("action", "Log: pipeline status update", "Update outreach tracker: mark responses, schedule 3 new messages for tomorrow, note which pitch angles got replies.", "Tracker fully updated", "3 next outreach actions dated for the coming week", true);
      break;
    case "reflect":
      add("action", "Send: final outreach wave", "Send 3 outreach messages to remaining high-priority targets. Use Hosted Stay or Boutique Hotel template with media kit attached.", "3 final outreach messages sent", "All messages logged with follow-up dates", true);
      add("create", "Publish: partnership-ready announcement", "Post one reel or carousel on {instagram} stating you're available for {tier} collaborations. CTA: link in bio for partnerships.", "1 live partnership announcement post", "Post includes clear collaboration CTA and media kit link", true);
      add("create", "Build: dated 30-day action calendar", "In Google Calendar or Notion: schedule 10 outreach dates, 8 content shoot/post dates, 3 proposal send dates for the next 30 days.", "30-day calendar with named targets", "Every entry has a specific business name and deliverable", true);
      break;
  }

  if (tasks.length < 3) {
    add(
      "action",
      "Complete today's partnership action",
      `Finish Day ${dayNumber} objective: ${framework.objective}. This moves you closer to {goal} and directly addresses {challenge}.`,
      `Day ${dayNumber} deliverable saved`,
      "Deliverable saved and logged — visible proof of progress toward your first partnership",
      true
    );
  }

  return tasks.slice(0, 5).map((task, index) => ({ ...task, taskOrder: index + 1 }));
}

export function buildPlanSummary(ctx: CreatorContext): PlanSummary {
  return {
    title: `${ctx.fullName}'s 40-Day Partnership Plan`,
    subtitle: `Built for ${ctx.archetype} creators pursuing ${ctx.dreamPartnerships} — starting in ${ctx.location}`,
    primaryGoal: ctx.primaryGoal,
    creatorStage: ctx.stage,
    creatorArchetype: ctx.archetype,
    idealPartnershipTier: ctx.tier,
  };
}

export function generatePlanBlueprint(input: PlanGenerationInput): PlanBlueprint {
  const ctx = input.creatorContext;
  const days = DAY_FRAMEWORK.map((framework, index) => {
    const dayNumber = index + 1;
    return {
      dayNumber,
      weekNumber: weekNumberForDay(dayNumber),
      title: p(ctx, framework.title),
      objective: p(ctx, framework.objective),
      focusArea: themeToFocusArea(framework.theme),
      estimatedMinutes: framework.estimatedMinutes,
    };
  });

  return {
    planSummary: buildPlanSummary(ctx),
    days,
  };
}

export function generatePlanWeeks(input: PlanGenerationInput): PlanWeeksOutput {
  const ctx = input.creatorContext;
  return {
    weeks: WEEK_FRAMEWORK.map((week, index) => ({
      weekNumber: index + 1,
      title: p(ctx, week.title),
      milestone: p(ctx, week.milestone),
      successCriteria: p(ctx, week.successCriteria),
      startDay: index * 7 + 1,
      endDay: Math.min((index + 1) * 7, 40),
    })),
  };
}

export function generateAllDayTasks(
  input: PlanGenerationInput,
  blueprint: PlanBlueprint
): PlanDayTasksBatch {
  const ctx = input.creatorContext;
  return {
    days: blueprint.days.map((day) => {
      const framework = DAY_FRAMEWORK[day.dayNumber - 1];
      return {
        dayNumber: day.dayNumber,
        tasks: buildTasksForDay(day.dayNumber, framework, ctx),
      };
    }),
  };
}

export function generatePlanFromTemplates(input: PlanGenerationInput): {
  blueprint: PlanBlueprint;
  weeks: PlanWeeksOutput;
  dayTasks: PlanDayTasksBatch;
} {
  const blueprint = generatePlanBlueprint(input);
  const weeks = generatePlanWeeks(input);
  const dayTasks = generateAllDayTasks(input, blueprint);
  return { blueprint, weeks, dayTasks };
}

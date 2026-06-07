import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";
import { SITE_NAME } from "@/lib/constants";
import type { AssessmentRecord } from "@/lib/assessment-schema";
import type { PlanGraph } from "@/lib/plan/plan-schema";

const MARGIN = 54;
const BOTTOM_MARGIN = 72;
const BRAND = "#111111";
const MUTED = "#666666";
const LIGHT = "#E8E8E4";

type RenderPlanPdfInput = {
  graph: PlanGraph;
  assessment: AssessmentRecord;
  fullName: string;
};

function pageBottom(doc: PDFKit.PDFDocument): number {
  return doc.page.height - BOTTOM_MARGIN;
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number): void {
  if (doc.y + height > pageBottom(doc)) {
    doc.addPage();
    drawPageHeader(doc);
  }
}

function drawPageHeader(doc: PDFKit.PDFDocument): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(MUTED)
    .text(SITE_NAME.toUpperCase(), MARGIN, MARGIN - 24, {
      width: doc.page.width - MARGIN * 2,
      align: "right",
    });
  doc
    .moveTo(MARGIN, MARGIN - 12)
    .lineTo(doc.page.width - MARGIN, MARGIN - 12)
    .strokeColor(LIGHT)
    .lineWidth(0.5)
    .stroke();
  doc.y = MARGIN;
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 48);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(BRAND)
    .text(title, MARGIN, doc.y, { width: doc.page.width - MARGIN * 2 });
  doc.moveDown(0.4);
}

function bodyText(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 40);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BRAND)
    .text(text, MARGIN, doc.y, {
      width: doc.page.width - MARGIN * 2,
      lineGap: 3,
    });
  doc.moveDown(0.6);
}

function bulletList(doc: PDFKit.PDFDocument, items: string[]): void {
  for (const item of items) {
    ensureSpace(doc, 24);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(BRAND)
      .text(`• ${item}`, MARGIN + 8, doc.y, {
        width: doc.page.width - MARGIN * 2 - 8,
        lineGap: 2,
      });
    doc.moveDown(0.3);
  }
  doc.moveDown(0.4);
}

function drawCover(doc: PDFKit.PDFDocument, fullName: string, planTitle: string): void {
  doc.rect(0, 0, doc.page.width, 120).fill(BRAND);
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor("#FFFFFF")
    .text(SITE_NAME.toUpperCase(), MARGIN, 48, { characterSpacing: 2 });
  doc
    .font("Times-Bold")
    .fontSize(28)
    .fillColor("#FFFFFF")
    .text("40-Day Creator\nDevelopment Plan", MARGIN, 78, { lineGap: 4 });

  doc.y = 160;
  doc
    .font("Times-Roman")
    .fontSize(22)
    .fillColor(BRAND)
    .text(planTitle, MARGIN, doc.y, { width: doc.page.width - MARGIN * 2 });
  doc.moveDown(1);
  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor(MUTED)
    .text(`Prepared for ${fullName}`, MARGIN, doc.y);
  doc.moveDown(2);
}

function renderAssessmentSection(doc: PDFKit.PDFDocument, assessment: AssessmentRecord): void {
  const { analysis } = assessment;
  const { preview, foundation, scores } = analysis;

  sectionTitle(doc, "Assessment Summary");
  bodyText(doc, foundation.creatorProfileSummary);

  sectionTitle(doc, "Creator Profile");
  bodyText(doc, `Archetype: ${preview.creatorArchetype}`);
  bodyText(doc, `Stage: ${preview.currentCreatorStage}`);
  bodyText(doc, `Ideal Partnership Tier: ${preview.idealPartnershipTier}`);

  sectionTitle(doc, "Readiness Scores");
  const scoreLines = [
    `Creator Readiness: ${scores.creatorReadiness}/100`,
    `Portfolio Strength: ${scores.portfolioStrength}/100`,
    `Content Quality: ${scores.contentQuality}/100`,
    `Partnership Potential: ${scores.partnershipPotential}/100`,
    `Luxury Travel Alignment: ${scores.luxuryTravelAlignment}/100`,
  ];
  bulletList(doc, scoreLines);

  sectionTitle(doc, "Top Strengths");
  bulletList(doc, preview.topStrengths);

  sectionTitle(doc, "Growth Opportunities");
  bulletList(doc, preview.growthOpportunities);

  sectionTitle(doc, "Personalized Recommendations");
  bodyText(doc, preview.recommendedNextStep);
  bulletList(doc, preview.priorityFocusAreas);
  const priorities = foundation.developmentPriorities.map(
    (item) => `${item.area} (${item.priority}): ${item.rationale}`
  );
  if (priorities.length > 0) {
    bulletList(doc, priorities);
  }
}

function renderPlanOverview(doc: PDFKit.PDFDocument, graph: PlanGraph): void {
  const summary = graph.instance.planSummary;

  doc.addPage();
  drawPageHeader(doc);
  sectionTitle(doc, "Your 40-Day Plan");
  bodyText(doc, summary.subtitle);
  bodyText(doc, `Primary Goal: ${summary.primaryGoal}`);
  bodyText(doc, `Creator Stage: ${summary.creatorStage}`);
  bodyText(doc, `Creator Archetype: ${summary.creatorArchetype}`);
  bodyText(doc, `Ideal Partnership Tier: ${summary.idealPartnershipTier}`);

  sectionTitle(doc, "Weekly Milestones");
  for (const week of graph.weeks) {
    ensureSpace(doc, 64);
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(BRAND)
      .text(`Week ${week.weekNumber}: ${week.title}`, MARGIN, doc.y);
    doc.moveDown(0.2);
    bodyText(doc, `Milestone: ${week.milestone}`);
    bodyText(doc, `Success Criteria: ${week.successCriteria}`);
  }
}

function renderDaysAndTasks(doc: PDFKit.PDFDocument, graph: PlanGraph): void {
  doc.addPage();
  drawPageHeader(doc);
  sectionTitle(doc, "Complete 40-Day Schedule");

  const tasksByDayId = new Map<string, typeof graph.tasks>();
  for (const task of graph.tasks) {
    const existing = tasksByDayId.get(task.planDayId) ?? [];
    existing.push(task);
    tasksByDayId.set(task.planDayId, existing);
  }

  const sortedDays = [...graph.days].sort((a, b) => a.dayNumber - b.dayNumber);

  for (const day of sortedDays) {
    ensureSpace(doc, 80);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor(BRAND)
      .text(`Day ${day.dayNumber} — Week ${day.weekNumber}`, MARGIN, doc.y);
    doc.moveDown(0.15);
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(BRAND)
      .text(day.title, MARGIN, doc.y);
    doc.moveDown(0.2);
    bodyText(doc, `Objective: ${day.objective}`);
    bodyText(doc, `Focus: ${day.focusArea} · ~${day.estimatedMinutes} min`);

    const dayTasks = (tasksByDayId.get(day.id) ?? []).sort(
      (a, b) => a.taskOrder - b.taskOrder
    );

    for (const task of dayTasks) {
      ensureSpace(doc, 72);
      const requiredLabel = task.isRequired ? "Required" : "Optional";
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(BRAND)
        .text(
          `Task ${task.taskOrder} · ${task.taskType} · ${requiredLabel}`,
          MARGIN + 12,
          doc.y
        );
      doc.moveDown(0.15);
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(BRAND)
        .text(task.title, MARGIN + 12, doc.y, {
          width: doc.page.width - MARGIN * 2 - 12,
        });
      doc.moveDown(0.15);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(MUTED)
        .text(task.instruction, MARGIN + 12, doc.y, {
          width: doc.page.width - MARGIN * 2 - 12,
          lineGap: 2,
        });
      doc.moveDown(0.2);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MUTED)
        .text(`Deliverable: ${task.deliverable}`, MARGIN + 12, doc.y, {
          width: doc.page.width - MARGIN * 2 - 12,
        });
      doc.moveDown(0.15);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MUTED)
        .text(`Success: ${task.successCriteria}`, MARGIN + 12, doc.y, {
          width: doc.page.width - MARGIN * 2 - 12,
        });
      doc.moveDown(0.5);
    }

    doc.moveDown(0.4);
  }
}

export async function renderPlanPdf(input: RenderPlanPdfInput): Promise<Buffer> {
  const planTitle = input.graph.instance.planSummary.title;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: MARGIN, autoFirstPage: true });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawCover(doc, input.fullName, planTitle);
    renderAssessmentSection(doc, input.assessment);
    renderPlanOverview(doc, input.graph);
    renderDaysAndTasks(doc, input.graph);

    doc.end();
  });
}

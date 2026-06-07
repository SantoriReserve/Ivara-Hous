import PDFDocument from "pdfkit";
import type PDFKit from "pdfkit";
import { SITE_NAME } from "@/lib/constants";
import type { AssessmentRecord } from "@/lib/assessment-schema";
import type { PlanGraph } from "@/lib/plan/plan-schema";
import { preparePdfContent, type PdfDayContent, type PreparedPdfContent } from "@/lib/plan/plan-pdf-copy";

const MARGIN = 54;
const HEADER_ZONE = 42;
const CONTENT_TOP = MARGIN + HEADER_ZONE;
const BOTTOM_MARGIN = 64;
const PAGE_WIDTH = 612;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const BRAND = "#111111";
const MUTED = "#6B6B66";
const LIGHT = "#E8E8E4";
const CARD_BG = "#F7F7F5";
const ACCENT = "#1A1A1A";

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

function drawPageHeader(doc: PDFKit.PDFDocument, section?: string): void {
  const y = MARGIN - 8;
  doc
    .font("Helvetica")
    .fontSize(7)
    .fillColor(MUTED)
    .text(SITE_NAME.toUpperCase(), MARGIN, y, { characterSpacing: 1.2 });

  if (section) {
    doc.text(section, MARGIN, y, {
      width: CONTENT_WIDTH,
      align: "right",
      characterSpacing: 0.8,
    });
  }

  doc
    .moveTo(MARGIN, y + 14)
    .lineTo(PAGE_WIDTH - MARGIN, y + 14)
    .strokeColor(LIGHT)
    .lineWidth(0.5)
    .stroke();

  doc.y = CONTENT_TOP;
}

function drawCover(doc: PDFKit.PDFDocument, content: PreparedPdfContent): void {
  const centerX = PAGE_WIDTH / 2;

  doc.rect(MARGIN, MARGIN, CONTENT_WIDTH, doc.page.height - MARGIN * 2).strokeColor(LIGHT).lineWidth(1).stroke();

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(MUTED)
    .text(SITE_NAME.toUpperCase(), MARGIN + 32, MARGIN + 80, {
      width: CONTENT_WIDTH - 64,
      align: "center",
      characterSpacing: 3,
    });

  doc
    .moveTo(centerX - 80, MARGIN + 108)
    .lineTo(centerX + 80, MARGIN + 108)
    .strokeColor(LIGHT)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Times-Bold")
    .fontSize(30)
    .fillColor(BRAND)
    .text("40-Day Creator", MARGIN + 32, MARGIN + 130, {
      width: CONTENT_WIDTH - 64,
      align: "center",
      lineGap: 6,
    });
  doc
    .font("Times-Bold")
    .fontSize(30)
    .fillColor(BRAND)
    .text("Development Plan", MARGIN + 32, doc.y, {
      width: CONTENT_WIDTH - 64,
      align: "center",
      lineGap: 6,
    });

  const metaY = MARGIN + 260;
  const labelX = MARGIN + 72;
  const valueX = MARGIN + 200;

  const metaRows: Array<[string, string]> = [
    ["Prepared For", content.fullName],
    ["Generated", content.generatedDate],
    ["Primary Goal", content.primaryGoal],
    ["Creator Stage", content.creatorStage],
  ];

  metaRows.forEach(([label, value], index) => {
    const rowY = metaY + index * 36;
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(MUTED)
      .text(label.toUpperCase(), labelX, rowY, { characterSpacing: 1 });
    doc
      .font("Times-Roman")
      .fontSize(13)
      .fillColor(BRAND)
      .text(value, valueX, rowY, { width: CONTENT_WIDTH - 220, lineGap: 2 });
  });

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "A personalized hospitality partnership strategy — built for execution, not inspiration.",
      MARGIN + 48,
      doc.page.height - MARGIN - 72,
      { width: CONTENT_WIDTH - 96, align: "center", lineGap: 3 }
    );
}

function sectionHeading(doc: PDFKit.PDFDocument, title: string, subtitle?: string): void {
  ensureSpace(doc, 56);
  doc
    .font("Times-Bold")
    .fontSize(20)
    .fillColor(BRAND)
    .text(title, MARGIN, doc.y, { width: CONTENT_WIDTH });
  doc.moveDown(0.15);
  if (subtitle) {
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(MUTED)
      .text(subtitle.toUpperCase(), MARGIN, doc.y, { characterSpacing: 1, width: CONTENT_WIDTH });
    doc.moveDown(0.5);
  } else {
    doc.moveDown(0.35);
  }
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + 48, doc.y)
    .strokeColor(BRAND)
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.8);
}

function bodyParagraph(doc: PDFKit.PDFDocument, text: string): void {
  ensureSpace(doc, 48);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BRAND)
    .text(text, MARGIN, doc.y, { width: CONTENT_WIDTH, lineGap: 4, align: "left" });
  doc.moveDown(0.7);
}

function labelValue(doc: PDFKit.PDFDocument, label: string, value: string): void {
  ensureSpace(doc, 36);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text(label.toUpperCase(), MARGIN, doc.y, {
    characterSpacing: 0.8,
  });
  doc.moveDown(0.15);
  bodyParagraph(doc, value);
}

function bulletItems(doc: PDFKit.PDFDocument, items: string[]): void {
  for (const item of items) {
    ensureSpace(doc, 28);
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(BRAND)
      .text(`•  ${item}`, MARGIN + 4, doc.y, { width: CONTENT_WIDTH - 8, lineGap: 3 });
    doc.moveDown(0.25);
  }
  doc.moveDown(0.4);
}

function renderExecutiveSummary(doc: PDFKit.PDFDocument, content: PreparedPdfContent): void {
  doc.addPage();
  drawPageHeader(doc, "Executive Summary");
  sectionHeading(doc, "Executive Summary", "Assessment & Strategy Overview");

  labelValue(doc, "Assessment Overview", content.assessmentOverview);

  sectionHeading(doc, "Creator Profile", "Positioning");
  labelValue(doc, "Archetype", content.creatorArchetype);
  labelValue(doc, "Current Stage", content.creatorStage);
  labelValue(doc, "Ideal Partnership Tier", content.idealPartnershipTier);
  labelValue(doc, "Positioning Statement", content.positioningStatement);
  labelValue(doc, "Niche Alignment", content.nicheAlignment);
  labelValue(doc, "Audience Profile", content.audienceProfile);

  ensureSpace(doc, 80);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("STRENGTHS", MARGIN, doc.y);
  doc.moveDown(0.2);
  bulletItems(doc, content.strengths);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("GROWTH OPPORTUNITIES", MARGIN, doc.y);
  doc.moveDown(0.2);
  bulletItems(doc, content.growthOpportunities);

  ensureSpace(doc, 72);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("READINESS SCORES", MARGIN, doc.y);
  doc.moveDown(0.35);

  const scoreColWidth = CONTENT_WIDTH / content.scorecards.length;
  const scoreRowY = doc.y;
  content.scorecards.forEach((card, index) => {
    const x = MARGIN + index * scoreColWidth;
    doc
      .font("Times-Bold")
      .fontSize(16)
      .fillColor(BRAND)
      .text(String(card.score), x, scoreRowY, { width: scoreColWidth - 4, align: "center" });
    doc
      .font("Helvetica")
      .fontSize(6.5)
      .fillColor(MUTED)
      .text(card.label.toUpperCase(), x, scoreRowY + 22, {
        width: scoreColWidth - 4,
        align: "center",
        characterSpacing: 0.4,
      });
  });
  doc.y = scoreRowY + 44;
  doc.moveDown(0.5);

  labelValue(doc, "Primary Goal", content.primaryGoal);
  labelValue(doc, "Recommended Next Step", content.recommendedNextStep);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("RECOMMENDED FOCUS AREAS", MARGIN, doc.y);
  doc.moveDown(0.2);
  bulletItems(doc, content.focusAreas);

  if (content.developmentPriorities.length > 0) {
    doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text("DEVELOPMENT PRIORITIES", MARGIN, doc.y);
    doc.moveDown(0.2);
    bulletItems(doc, content.developmentPriorities);
  }
}

function renderScorecards(doc: PDFKit.PDFDocument, content: PreparedPdfContent): void {
  doc.addPage();
  drawPageHeader(doc, "Readiness Scores");
  sectionHeading(doc, "Readiness Scorecards", "Your partnership readiness at a glance");

  const cardWidth = (CONTENT_WIDTH - 16) / 2;
  const cardHeight = 88;
  const gap = 14;

  for (let i = 0; i < content.scorecards.length; i += 2) {
    ensureSpace(doc, cardHeight + gap);
    const rowY = doc.y;

    for (let col = 0; col < 2; col++) {
      const card = content.scorecards[i + col];
      if (!card) break;

      const x = MARGIN + col * (cardWidth + 16);
      doc.rect(x, rowY, cardWidth, cardHeight).fill(CARD_BG).strokeColor(LIGHT).lineWidth(0.5).stroke();

      doc
        .font("Times-Bold")
        .fontSize(28)
        .fillColor(BRAND)
        .text(String(card.score), x + 16, rowY + 14, { width: 60 });

      doc.font("Helvetica").fontSize(7).fillColor(MUTED).text("/ 100", x + 52, rowY + 30);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .fillColor(BRAND)
        .text(card.label, x + 16, rowY + 48, { width: cardWidth - 32 });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor(MUTED)
        .text(card.explanation, x + 16, rowY + 62, {
          width: cardWidth - 32,
          height: 22,
          ellipsis: true,
        });
    }

    doc.y = rowY + cardHeight + gap;
  }

  doc.moveDown(0.5);
}

function renderRoadmap(doc: PDFKit.PDFDocument, content: PreparedPdfContent): void {
  doc.addPage();
  drawPageHeader(doc, "Strategy Roadmap");
  sectionHeading(doc, "Strategy Roadmap", "Your 6-week partnership journey");

  bodyParagraph(
    doc,
    "This roadmap shows how your 40-day plan builds momentum — from foundation through scale — before you enter the daily execution schedule."
  );

  for (const week of content.roadmap) {
    ensureSpace(doc, 108);
    const cardY = doc.y;

    doc.rect(MARGIN, cardY, CONTENT_WIDTH, 96).fill(CARD_BG).strokeColor(LIGHT).lineWidth(0.5).stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(MUTED)
      .text(`WEEK ${week.weekNumber}`, MARGIN + 16, cardY + 14, { characterSpacing: 1 });

    doc
      .font("Times-Bold")
      .fontSize(14)
      .fillColor(BRAND)
      .text(`${week.label}`, MARGIN + 16, cardY + 28);

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(ACCENT)
      .text(week.title, MARGIN + 16, cardY + 48, { width: CONTENT_WIDTH - 32 });

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(MUTED)
      .text(`${week.dayRange} · ${week.theme}`, MARGIN + 16, cardY + 62);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(BRAND)
      .text(week.milestone, MARGIN + 16, cardY + 76, {
        width: CONTENT_WIDTH - 32,
        height: 14,
        ellipsis: true,
      });

    doc.y = cardY + 108;
  }
}

function daySectionLabel(doc: PDFKit.PDFDocument, label: string): void {
  ensureSpace(doc, 20);
  doc.moveDown(0.35);
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED).text(label, MARGIN + 14, doc.y, {
    characterSpacing: 0.6,
  });
  doc.moveDown(0.2);
}

function renderDay(doc: PDFKit.PDFDocument, day: PdfDayContent): void {
  ensureSpace(doc, 140);
  const cardY = doc.y;

  doc.rect(MARGIN, cardY, CONTENT_WIDTH, 6).fill(BRAND);
  doc
    .rect(MARGIN, cardY + 6, CONTENT_WIDTH, 36)
    .fill(CARD_BG)
    .strokeColor(LIGHT)
    .lineWidth(0.5)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor(MUTED)
    .text(`DAY ${day.dayNumber}  ·  WEEK ${day.weekNumber}`, MARGIN + 14, cardY + 14, {
      characterSpacing: 0.8,
    });

  doc
    .font("Times-Bold")
    .fontSize(13)
    .fillColor(BRAND)
    .text(day.title, MARGIN + 14, cardY + 28, { width: CONTENT_WIDTH - 28 });

  doc.y = cardY + 52;
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(`${day.focusArea} · ~${day.estimatedMinutes} min`, MARGIN + 14, doc.y, {
      width: CONTENT_WIDTH - 28,
    });

  daySectionLabel(doc, "OBJECTIVE");
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(BRAND)
    .text(day.objective, MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28, lineGap: 3 });
  doc.moveDown(0.15);

  daySectionLabel(doc, "TASKS");
  for (const task of day.tasks) {
    ensureSpace(doc, 64);
    doc.moveDown(0.15);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor(BRAND)
      .text(
        `Task ${task.order} · ${task.type}${task.required ? "" : " · Optional"}`,
        MARGIN + 14,
        doc.y
      );
    doc.moveDown(0.15);
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor(BRAND)
      .text(task.title, MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28 });
    doc.moveDown(0.15);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(BRAND)
      .text(task.instruction, MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28, lineGap: 2 });
    doc.moveDown(0.1);
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(MUTED)
      .text(`Deliverable: ${task.deliverable}`, MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28 });
    doc.moveDown(0.05);
  }

  daySectionLabel(doc, "SUCCESS CRITERIA");
  for (const criterion of day.successCriteria) {
    ensureSpace(doc, 20);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(BRAND)
      .text(`•  ${criterion}`, MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28, lineGap: 2 });
    doc.moveDown(0.15);
  }

  daySectionLabel(doc, "RESOURCES");
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(BRAND)
    .text(day.resources.join(" · "), MARGIN + 14, doc.y, { width: CONTENT_WIDTH - 28, lineGap: 2 });

  doc.moveDown(0.6);
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(PAGE_WIDTH - MARGIN, doc.y)
    .strokeColor(LIGHT)
    .lineWidth(0.5)
    .stroke();
  doc.moveDown(0.8);
}

function renderDailyPlan(doc: PDFKit.PDFDocument, content: PreparedPdfContent): void {
  doc.addPage();
  drawPageHeader(doc, "40-Day Plan");
  sectionHeading(doc, "Your 40-Day Plan", "Daily objectives, tasks, and success criteria");

  bodyParagraph(doc, content.subtitle);

  for (const day of content.days) {
    renderDay(doc, day);
  }
}

export async function renderPlanPdf(input: RenderPlanPdfInput): Promise<Buffer> {
  const content = preparePdfContent(input.graph, input.assessment, input.fullName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: MARGIN, bottom: BOTTOM_MARGIN, left: MARGIN, right: MARGIN },
      autoFirstPage: true,
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.y = MARGIN;
    drawCover(doc, content);
    renderExecutiveSummary(doc, content);
    renderScorecards(doc, content);
    renderRoadmap(doc, content);
    renderDailyPlan(doc, content);

    doc.end();
  });
}

import { getAssessmentById } from "@/lib/assessment-repository";
import { sendPlanPdfEmail } from "@/lib/email/send-plan-pdf";
import { hasPlanPdfBeenSent } from "@/lib/email/email-delivery-repository";
import { PLAN_PDF_FILENAME } from "@/lib/plan/plan-pdf-copy";
import { renderPlanPdf } from "@/lib/plan/plan-pdf-generator";
import { getPlanGraph } from "@/lib/plan/plan-repository";
import type { PlanGraph } from "@/lib/plan/plan-schema";

export type PlanPdfExportInput = {
  planInstanceId: string;
  userId: string;
};

export type PlanPdfExportResult = {
  filename: string;
  contentType: "application/pdf";
  buffer: Buffer;
};

export type DeliverPlanPdfParams = {
  userId: string;
  purchaseId: string;
  planInstanceId: string;
  recipientEmail: string;
  fullName: string;
};

export function buildPlanPdfFilename(_graph?: PlanGraph): string {
  return PLAN_PDF_FILENAME;
}

export async function generatePlanPdf(
  input: PlanPdfExportInput
): Promise<PlanPdfExportResult> {
  const graph = await getPlanGraph(input.planInstanceId);
  if (!graph) {
    throw new Error("Plan not found for PDF export");
  }

  const assessment = await getAssessmentById(graph.instance.assessmentId);
  if (!assessment) {
    throw new Error("Assessment not found for PDF export");
  }

  const fullName = assessment.answers.fullName || "Creator";
  const buffer = await renderPlanPdf({ graph, assessment, fullName });

  return {
    filename: buildPlanPdfFilename(graph),
    contentType: "application/pdf",
    buffer,
  };
}

export async function deliverPlanPdfIfNeeded(params: DeliverPlanPdfParams): Promise<void> {
  try {
    const alreadySent = await hasPlanPdfBeenSent(params.planInstanceId);
    if (alreadySent) {
      return;
    }

    const graph = await getPlanGraph(params.planInstanceId);
    if (!graph || graph.instance.status !== "active") {
      return;
    }

    const { buffer, filename } = await generatePlanPdf({
      planInstanceId: params.planInstanceId,
      userId: params.userId,
    });

    const result = await sendPlanPdfEmail({
      to: params.recipientEmail,
      fullName: params.fullName,
      userId: params.userId,
      purchaseId: params.purchaseId,
      planInstanceId: params.planInstanceId,
      planTitle: graph.instance.planSummary.title,
      pdfBuffer: buffer,
      pdfFilename: filename,
    });

    if (!result.sent) {
      console.error("[plan-pdf] Delivery failed:", result.reason);
    }
  } catch (error) {
    console.error(
      "[plan-pdf] Delivery error:",
      error instanceof Error ? error.message : error
    );
  }
}

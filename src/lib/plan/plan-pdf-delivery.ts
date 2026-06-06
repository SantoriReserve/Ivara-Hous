/**
 * PDF delivery architecture (Phase 3B.2+).
 *
 * Single source of truth: plan_instances + child tables (same graph as dashboard).
 * PDF export reads PlanGraph — never a separate generated artifact store.
 *
 * Future flow:
 * 1. generatePlanPdf(planInstanceId) → Buffer + filename
 * 2. uploadPlanPdf(buffer) → storage URL (Supabase Storage or S3)
 * 3. sendPlanPdfEmail({ userId, purchaseId, planInstanceId, pdfUrl })
 * 4. record email_deliveries with email_type = 'plan_pdf' + attachment_url
 * 5. Dashboard download button calls GET /api/plan/pdf (signed URL)
 */

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

export type PlanPdfEmailPayload = {
  to: string;
  fullName: string;
  userId: string;
  purchaseId: string;
  planInstanceId: string;
  pdfUrl: string;
};

export function buildPlanPdfFilename(graph: PlanGraph): string {
  const slug = graph.instance.planSummary.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `ivara-hous-40-day-plan-${slug || graph.instance.id}.pdf`;
}

export async function generatePlanPdf(
  input: PlanPdfExportInput
): Promise<PlanPdfExportResult> {
  void input;
  throw new Error("Plan PDF generation is not implemented yet (Phase 3B.2+)");
}

export async function sendPlanPdfEmail(payload: PlanPdfEmailPayload): Promise<void> {
  void payload;
  throw new Error("Plan PDF email delivery is not implemented yet (Phase 3B.2+)");
}

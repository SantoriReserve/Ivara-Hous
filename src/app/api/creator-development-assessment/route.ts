import { apiError, apiSuccess } from "@/lib/api-response";
import { saveAssessmentResult } from "@/lib/assessment-repository";
import {
  ASSESSMENT_SCHEMA_VERSION,
  assessmentAnswersSchema,
  type AssessmentResult,
} from "@/lib/assessment-schema";
import { generateAssessmentAnalysis } from "@/lib/openai-assessment";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = assessmentAnswersSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Please complete all required assessment fields.", 400);
    }

    const analysis = await generateAssessmentAnalysis(parsed.data);

    const assessmentId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const record = {
      assessmentId,
      submittedAt,
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      answers: parsed.data,
      source: "creator-development-assessment" as const,
      analysis,
      paymentStatus: "free" as const,
    };

    await saveAssessmentResult(record);

    const result: AssessmentResult = {
      assessmentId,
      submittedAt,
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      answers: parsed.data,
      source: "creator-development-assessment",
      analysis,
    };

    return apiSuccess({
      message: "Assessment complete",
      result,
    });
  } catch (error) {
    console.error("[creator-development-assessment] Error:", error);
    return apiError(
      "We could not generate your assessment. Please try again in a moment.",
      500
    );
  }
}

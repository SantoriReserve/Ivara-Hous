import type { AssessmentRecord } from "@/lib/assessment-schema";

export interface AssessmentRepository {
  save(record: AssessmentRecord): Promise<{ assessmentId: string }>;
  getById(assessmentId: string): Promise<AssessmentRecord | null>;
}

/** In-memory stub — replace with Notion/DB implementation later. */
class ConsoleAssessmentRepository implements AssessmentRepository {
  async save(record: AssessmentRecord): Promise<{ assessmentId: string }> {
    console.log("[assessment-repository] Saved assessment record:", {
      assessmentId: record.assessmentId,
      email: record.answers.email,
      submittedAt: record.submittedAt,
      scores: record.analysis.scores,
      developmentFoundation: record.analysis.developmentFoundation,
      paymentStatus: record.paymentStatus,
    });
    return { assessmentId: record.assessmentId };
  }

  async getById(assessmentId: string): Promise<AssessmentRecord | null> {
    console.log("[assessment-repository] getById called:", assessmentId);
    return null;
  }
}

const repository: AssessmentRepository = new ConsoleAssessmentRepository();

export async function saveAssessmentResult(
  record: AssessmentRecord
): Promise<{ assessmentId: string }> {
  return repository.save(record);
}

export async function getAssessmentById(
  assessmentId: string
): Promise<AssessmentRecord | null> {
  return repository.getById(assessmentId);
}

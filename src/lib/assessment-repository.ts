import type {
  AssessmentRecord,
  AssessmentSchemaVersion,
} from "@/lib/assessment-schema";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface AssessmentRepository {
  save(record: AssessmentRecord): Promise<{ assessmentId: string }>;
  getById(assessmentId: string): Promise<AssessmentRecord | null>;
  updatePaymentStatus(
    assessmentId: string,
    paymentStatus: AssessmentRecord["paymentStatus"]
  ): Promise<void>;
}

type AssessmentRow = {
  id: string;
  email: string;
  full_name: string;
  schema_version: string;
  source: AssessmentRecord["source"];
  answers: AssessmentRecord["answers"];
  analysis: AssessmentRecord["analysis"];
  payment_status: AssessmentRecord["paymentStatus"];
  submitted_at: string;
};

function toAssessmentRow(record: AssessmentRecord): AssessmentRow {
  return {
    id: record.assessmentId,
    email: record.answers.email,
    full_name: record.answers.fullName,
    schema_version: record.schemaVersion,
    source: record.source,
    answers: record.answers,
    analysis: record.analysis,
    payment_status: record.paymentStatus,
    submitted_at: record.submittedAt,
  };
}

function mapAssessmentRow(row: AssessmentRow): AssessmentRecord {
  return {
    assessmentId: row.id,
    submittedAt: row.submitted_at,
    schemaVersion: row.schema_version as AssessmentSchemaVersion,
    answers: row.answers,
    source: row.source,
    analysis: row.analysis,
    paymentStatus: row.payment_status,
  };
}

class SupabaseAssessmentRepository implements AssessmentRepository {
  async save(record: AssessmentRecord): Promise<{ assessmentId: string }> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("assessments").insert(toAssessmentRow(record));

    if (error) {
      throw new Error(`Failed to save assessment: ${error.message}`);
    }

    return { assessmentId: record.assessmentId };
  }

  async getById(assessmentId: string): Promise<AssessmentRecord | null> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to load assessment: ${error.message}`);
    }

    return data ? mapAssessmentRow(data as AssessmentRow) : null;
  }

  async updatePaymentStatus(
    assessmentId: string,
    paymentStatus: AssessmentRecord["paymentStatus"]
  ): Promise<void> {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("assessments")
      .update({ payment_status: paymentStatus })
      .eq("id", assessmentId);

    if (error) {
      throw new Error(`Failed to update assessment payment status: ${error.message}`);
    }
  }
}

const repository: AssessmentRepository = new SupabaseAssessmentRepository();

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

export async function updateAssessmentPaymentStatus(
  assessmentId: string,
  paymentStatus: AssessmentRecord["paymentStatus"]
): Promise<void> {
  return repository.updatePaymentStatus(assessmentId, paymentStatus);
}

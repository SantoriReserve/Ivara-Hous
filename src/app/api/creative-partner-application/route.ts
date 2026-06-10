import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";
import { recordPartnerInquiry } from "@/lib/forms/form-submission-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as Record<string, unknown>;
    const result = await handleFormSubmission("creative-partner-application", payload);

    try {
      await recordPartnerInquiry("creative-partner-application", payload);
    } catch (storageError) {
      console.error("[creative-partner-application] Supabase storage failed:", storageError);
    }

    return apiSuccess({ message: "Creative partner application received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

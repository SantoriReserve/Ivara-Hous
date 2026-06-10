import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";
import { recordPartnerInquiry } from "@/lib/forms/form-submission-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as Record<string, unknown>;
    const result = await handleFormSubmission("partner-with-us", payload);

    try {
      await recordPartnerInquiry("partner-with-us", payload);
    } catch (storageError) {
      console.error("[partner-with-us] Supabase storage failed:", storageError);
    }

    return apiSuccess({ message: "Partnership inquiry received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

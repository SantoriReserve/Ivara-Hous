import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";
import { notifyOwnerPartnerInquiry } from "@/lib/email/owner-notifications";
import { recordPartnerInquiry } from "@/lib/forms/form-submission-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as Record<string, unknown>;
    const result = await handleFormSubmission("creative-partner-application", payload);

    let storageResult: Awaited<ReturnType<typeof recordPartnerInquiry>> | undefined;
    try {
      storageResult = await recordPartnerInquiry("creative-partner-application", payload);
    } catch (storageError) {
      console.error("[creative-partner-application] Supabase storage failed:", storageError);
    }

    try {
      await notifyOwnerPartnerInquiry({
        source: "creative-partner-application",
        body: payload,
        recordId: storageResult?.id,
      });
    } catch (ownerNotificationError) {
      console.error("[creative-partner-application] Owner notification failed:", ownerNotificationError);
    }

    return apiSuccess({ message: "Creative partner application received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

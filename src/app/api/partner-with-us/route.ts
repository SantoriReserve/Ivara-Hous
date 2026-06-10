import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";
import { notifyOwnerPartnerInquiry } from "@/lib/email/owner-notifications";
import { recordPartnerInquiry } from "@/lib/forms/form-submission-repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body as Record<string, unknown>;
    const result = await handleFormSubmission("partner-with-us", payload);

    let storageResult: Awaited<ReturnType<typeof recordPartnerInquiry>> | undefined;
    try {
      storageResult = await recordPartnerInquiry("partner-with-us", payload);
    } catch (storageError) {
      console.error("[partner-with-us] Supabase storage failed:", storageError);
    }

    try {
      await notifyOwnerPartnerInquiry({
        source: "partner-with-us",
        body: payload,
        recordId: storageResult?.id,
      });
    } catch (ownerNotificationError) {
      console.error("[partner-with-us] Owner notification failed:", ownerNotificationError);
    }

    return apiSuccess({ message: "Partnership inquiry received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

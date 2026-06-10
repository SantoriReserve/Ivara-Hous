import { apiError, apiSuccess } from "@/lib/api-response";
import { recordCreatorApplication } from "@/lib/forms/form-submission-repository";
import { sendCreatorApplicationToMake } from "@/lib/make-webhook";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return apiError("Something went wrong. Please try again.", 400);
    }

    const payload = body as Record<string, unknown>;
    await sendCreatorApplicationToMake(payload);

    try {
      await recordCreatorApplication(payload);
    } catch (storageError) {
      console.error("[creator-application] Supabase storage failed:", storageError);
    }

    return apiSuccess({ message: "Creator application received" });
  } catch (error) {
    console.error("[creator-application] Webhook error:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

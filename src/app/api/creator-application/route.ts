import { apiError, apiSuccess } from "@/lib/api-response";
import { sendCreatorApplicationToMake } from "@/lib/make-webhook";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return apiError("Something went wrong. Please try again.", 400);
    }

    await sendCreatorApplicationToMake(body as Record<string, unknown>);
    return apiSuccess({ message: "Creator application received" });
  } catch (error) {
    console.error("[creator-application] Webhook error:", error);
    return apiError("Something went wrong. Please try again.", 500);
  }
}

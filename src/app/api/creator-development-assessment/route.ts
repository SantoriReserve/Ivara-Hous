import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleFormSubmission(
      "creator-development-assessment",
      body
    );
    return apiSuccess({ message: "Assessment submitted", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

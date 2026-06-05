import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleFormSubmission("creator-application", body);
    return apiSuccess({ message: "Creator application received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

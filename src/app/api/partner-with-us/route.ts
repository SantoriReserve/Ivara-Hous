import { apiError, apiSuccess, handleFormSubmission } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await handleFormSubmission("partner-with-us", body);
    return apiSuccess({ message: "Partnership inquiry received", data: result });
  } catch {
    return apiError("Invalid request body");
  }
}

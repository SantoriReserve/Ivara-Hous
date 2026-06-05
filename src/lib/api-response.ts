import { NextResponse } from "next/server";

export function apiSuccess<T extends Record<string, unknown>>(
  data: T,
  status = 200
) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Placeholder handler for form submissions.
 * TODO: Integrate Notion, email (Resend/SendGrid), Stripe, OpenAI as needed.
 */
export async function handleFormSubmission(
  formType: string,
  payload: Record<string, unknown>
) {
  // Future integrations:
  // - Notion: create database row
  // - Email: notify team + send confirmation
  // - Stripe: checkout for assessment plan
  // - OpenAI: score assessment responses

  console.log(`[${formType}] Submission received:`, payload);

  return {
    received: true,
    formType,
    timestamp: new Date().toISOString(),
  };
}

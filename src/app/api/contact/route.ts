import { apiError, apiSuccess } from "@/lib/api-response";
import {
  sendContactFormEmails,
  type ContactFormPayload,
} from "@/lib/email/send-contact-confirmation";
import { recordContactInquiry } from "@/lib/forms/form-submission-repository";

function parseContactPayload(body: Record<string, unknown>): ContactFormPayload | null {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const inquiryType = typeof body.inquiryType === "string" ? body.inquiryType.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!name || !email || !inquiryType || !subject || !message) {
    return null;
  }

  return { name, email, inquiryType, subject, message };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseContactPayload(body);

    if (!payload) {
      return apiError("Please complete all required fields.", 400);
    }

    const emailResult = await sendContactFormEmails(payload);

    try {
      await recordContactInquiry(payload);
    } catch (storageError) {
      console.error("[contact] Supabase storage failed:", storageError);
    }

    return apiSuccess({
      message: "Contact message received",
      data: {
        received: true,
        formType: "contact",
        timestamp: new Date().toISOString(),
        customerConfirmationSent: emailResult.customerConfirmationSent,
        teamNotificationSent: emailResult.teamNotificationSent,
      },
    });
  } catch {
    return apiError("Invalid request body");
  }
}

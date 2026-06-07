import { escapeHtml } from "@/lib/email/escape-html";
import {
  renderContactFormConfirmationEmail,
  renderBrandedEmail,
} from "@/lib/email/templates";
import { sendBrandedEmail } from "@/lib/email/send-email";
import { getSupportEmail } from "@/lib/email/env";

export type ContactFormPayload = {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
};

function inquiryTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    general: "General Inquiry",
    creator: "Creator",
    partner: "Partnership",
    "partnership-management": "Creator Partnership Management",
    travel: "Luxury Travel Coordination",
    press: "Press / Media",
  };
  return labels[value] ?? value;
}

export async function sendContactFormEmails(
  payload: ContactFormPayload
): Promise<{ customerConfirmationSent: boolean; teamNotificationSent: boolean }> {
  const customerName = payload.name.trim() || "Guest";
  const customerEmail = payload.email.trim().toLowerCase();
  const supportEmail = getSupportEmail();

  const { subject, html } = renderContactFormConfirmationEmail({
    fullName: customerName,
    subject: payload.subject.trim(),
  });

  const customerResult = await sendBrandedEmail({
    to: customerEmail,
    subject,
    html,
    emailType: "contact_confirmation",
  });

  const safeName = escapeHtml(customerName);
  const safeEmail = escapeHtml(customerEmail);
  const safeSubject = escapeHtml(payload.subject.trim());
  const safeInquiryType = escapeHtml(inquiryTypeLabel(payload.inquiryType));
  const safeMessage = escapeHtml(payload.message.trim());

  const teamHtml = renderBrandedEmail({
    eyebrow: "New Contact Inquiry",
    preheader: `New contact form submission from ${customerName}`,
    headline: payload.subject.trim() || "New inquiry",
    bodyHtml: `
      <p style="margin:0 0 14px;"><strong>Name:</strong> ${safeName}</p>
      <p style="margin:0 0 14px;"><strong>Email:</strong> ${safeEmail}</p>
      <p style="margin:0 0 14px;"><strong>Inquiry type:</strong> ${safeInquiryType}</p>
      <p style="margin:0 0 14px;"><strong>Subject:</strong> ${safeSubject}</p>
      <p style="margin:0 0 8px;"><strong>Message:</strong></p>
      <p style="margin:0;white-space:pre-wrap;">${safeMessage}</p>
    `,
    footerNote: `Internal notification — submitted via ivarahous.com contact form.`,
  });

  const teamResult = await sendBrandedEmail({
    to: supportEmail,
    subject: `[Contact] ${payload.subject.trim()} — ${customerName}`,
    html: teamHtml,
    emailType: "contact_form_internal",
  });

  return {
    customerConfirmationSent: customerResult.sent,
    teamNotificationSent: teamResult.sent,
  };
}

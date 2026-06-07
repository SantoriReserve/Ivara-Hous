export function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return key;
}

export function getEmailFromAddress(): string {
  const from = process.env.EMAIL_FROM?.trim();
  return from || "Ivara Hous <info@ivarahous.com>";
}

export function getSupportEmail(): string {
  const support = process.env.SUPPORT_EMAIL?.trim();
  return support || "info@ivarahous.com";
}

export function getReplyToEmail(): string {
  const replyTo = process.env.REPLY_TO_EMAIL?.trim();
  return replyTo || getSupportEmail();
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

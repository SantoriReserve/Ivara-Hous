export function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return key;
}

export function getEmailFromAddress(): string {
  return process.env.EMAIL_FROM ?? "Ivara Hous <info@ivarahous.com>";
}

export function getSupportEmail(): string {
  return process.env.SUPPORT_EMAIL ?? "info@ivarahous.com";
}

export function getReplyToEmail(): string {
  return process.env.REPLY_TO_EMAIL ?? getSupportEmail();
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

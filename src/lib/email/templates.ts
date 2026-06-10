import { SITE_NAME } from "@/lib/constants";
import { getSupportEmail } from "@/lib/email/env";

const PALETTE = {
  pageBg: "#f4f4f1",
  cardBg: "#ffffff",
  border: "#e3e3de",
  headline: "#111111",
  body: "#3d3d3d",
  muted: "#8a8a86",
  charcoal: "#2a2a2a",
  black: "#000000",
  white: "#ffffff",
  divider: "#ecece8",
} as const;

type EmailLayoutParams = {
  preheader: string;
  headline: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  footerNote?: string;
  eyebrow?: string;
};

function renderDivider(): string {
  return `<tr>
    <td style="padding:0 32px;">
      <div style="height:1px;background:${PALETTE.divider};"></div>
    </td>
  </tr>`;
}

function renderFooter(supportEmail: string, footerNote?: string): string {
  return `<tr>
    <td style="padding:28px 32px 36px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:${PALETTE.muted};">
      ${
        footerNote ??
        `Questions? Reply to this email or contact us at <a href="mailto:${supportEmail}" style="color:${PALETTE.charcoal};text-decoration:none;">${supportEmail}</a>.`
      }
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid ${PALETTE.divider};">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:${PALETTE.charcoal};">
          ${SITE_NAME}
        </div>
        <div style="margin-top:6px;font-size:11px;color:${PALETTE.muted};">
          Luxury hospitality for travel creators
        </div>
      </div>
    </td>
  </tr>`;
}

function renderCtaButton(label: string, url: string, variant: "primary" | "secondary"): string {
  const isPrimary = variant === "primary";
  return `<a href="${url}" style="display:inline-block;${
    isPrimary
      ? `background:${PALETTE.black};color:${PALETTE.white};`
      : `background:transparent;color:${PALETTE.charcoal};border:1px solid ${PALETTE.charcoal};`
  }text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;padding:15px 28px;border-radius:0;margin-right:12px;margin-bottom:12px;">
    ${label}
  </a>`;
}

export function renderBrandedEmail({
  preheader,
  headline,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  footerNote,
  eyebrow,
}: EmailLayoutParams): string {
  const supportEmail = getSupportEmail();
  const eyebrowBlock = eyebrow
    ? `<tr>
        <td style="padding:36px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${PALETTE.muted};">
          ${eyebrow}
        </td>
      </tr>`
    : `<tr>
        <td style="padding:36px 32px 0;font-family:Georgia,'Times New Roman',serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${PALETTE.muted};">
          ${SITE_NAME}
        </td>
      </tr>`;

  const hasPrimaryCta = Boolean(ctaLabel && ctaUrl);
  const hasSecondaryCta = Boolean(secondaryCtaLabel && secondaryCtaUrl);
  const ctaBlock =
    hasPrimaryCta || hasSecondaryCta
      ? `<tr>
          <td style="padding:32px 32px 8px;" align="left">
            ${hasPrimaryCta && ctaLabel && ctaUrl ? renderCtaButton(ctaLabel, ctaUrl, "primary") : ""}
            ${hasSecondaryCta && secondaryCtaLabel && secondaryCtaUrl ? renderCtaButton(secondaryCtaLabel, secondaryCtaUrl, "secondary") : ""}
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${headline}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { padding: 20px 12px !important; }
        .email-card { width: 100% !important; }
        .email-pad { padding-left: 24px !important; padding-right: 24px !important; }
        .email-headline { font-size: 26px !important; line-height: 1.25 !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${PALETTE.pageBg};-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-shell" style="background:${PALETTE.pageBg};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-card" style="max-width:580px;background:${PALETTE.cardBg};border:1px solid ${PALETTE.border};">
            ${eyebrowBlock}
            <tr>
              <td class="email-pad email-headline" style="padding:14px 32px 0;font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:1.22;color:${PALETTE.headline};">
                ${headline}
              </td>
            </tr>
            ${renderDivider()}
            <tr>
              <td class="email-pad" style="padding:28px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:${PALETTE.body};">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaBlock}
            ${renderFooter(supportEmail, footerNote)}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function firstNameFrom(fullName: string): string {
  return fullName.trim().split(" ")[0] || "Creator";
}

export function renderPurchaseCompleteEmail(params: {
  fullName: string;
  productName: string;
  planTitle: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const firstName = firstNameFrom(params.fullName);

  return {
    subject: `Your ${params.productName} is confirmed — ${SITE_NAME}`,
    html: renderBrandedEmail({
      eyebrow: "Purchase Confirmed",
      preheader:
        "Thank you for your purchase. Your dashboard is ready and your 40-Day Creator Development Plan PDF is attached.",
      headline: `Thank you, ${firstName}`,
      bodyHtml: `
        <p style="margin:0 0 18px;">Your purchase of <strong style="color:${PALETTE.charcoal};">${params.productName}</strong> is confirmed.</p>
        <p style="margin:0 0 18px;">Your personalized plan — <strong style="color:${PALETTE.charcoal};">${params.planTitle}</strong> — is attached to this email as a PDF for your records. It includes your assessment summary, creator archetype, readiness scores, and the complete 40-day roadmap.</p>
        <p style="margin:0 0 10px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.muted};">Your dashboard</p>
        <p style="margin:0 0 18px;">Sign in with the email and password you created at checkout to access your creator operating system:</p>
        <ol style="margin:0 0 18px;padding-left:20px;">
          <li style="margin-bottom:10px;"><strong>Today</strong> — daily focus, tasks, and learning insights</li>
          <li style="margin-bottom:10px;"><strong>Partnerships</strong> — hospitality targets with outreach actions</li>
          <li style="margin-bottom:10px;"><strong>Pitch Templates</strong> — ready-to-send partnership copy</li>
          <li style="margin-bottom:10px;"><strong>Content Ideas</strong> — assignments with production tracking</li>
        </ol>
        <p style="margin:0;">Your plan is live. Open your dashboard to begin Day 1.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

export function renderPdfDeliveryEmail(params: {
  fullName: string;
  planTitle: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const firstName = firstNameFrom(params.fullName);

  return {
    subject: `Your ${params.planTitle} — ${SITE_NAME}`,
    html: renderBrandedEmail({
      eyebrow: "Plan Delivery",
      preheader: "Your 40-Day Creator Development Plan PDF is attached.",
      headline: `${firstName}, your plan is attached`,
      bodyHtml: `
        <p style="margin:0 0 18px;">As requested, your complete <strong style="color:${PALETTE.charcoal};">${params.planTitle}</strong> is attached to this email.</p>
        <p style="margin:0 0 18px;">For daily execution — tasks, partnerships, pitch templates, and content tracking — continue in your dashboard.</p>
        <p style="margin:0;">If you have any trouble opening the attachment, reply to this email and our team will assist.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

export function renderContactFormConfirmationEmail(params: {
  fullName: string;
  subject: string;
}): { subject: string; html: string } {
  const firstName = firstNameFrom(params.fullName);

  return {
    subject: `We received your message — ${SITE_NAME}`,
    html: renderBrandedEmail({
      eyebrow: "Message Received",
      preheader: "Thank you for contacting Ivara Hous. We will respond within 2–3 business days.",
      headline: `Thank you, ${firstName}`,
      bodyHtml: `
        <p style="margin:0 0 18px;">We have received your inquiry regarding <strong style="color:${PALETTE.charcoal};">${params.subject}</strong>.</p>
        <p style="margin:0 0 18px;">A member of the ${SITE_NAME} team will review your message and respond within <strong>2–3 business days</strong>.</p>
        <p style="margin:0;">If your matter is urgent, reply to this email and we will prioritize your request.</p>
      `,
    }),
  };
}

export function renderGeneralCustomerNotificationEmail(params: {
  fullName: string;
  title: string;
  messageHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): { subject: string; html: string } {
  const firstName = firstNameFrom(params.fullName);

  return {
    subject: `${params.title} — ${SITE_NAME}`,
    html: renderBrandedEmail({
      eyebrow: "Ivara Hous",
      preheader: params.title,
      headline: `Hello, ${firstName}`,
      bodyHtml: params.messageHtml,
      ctaLabel: params.ctaLabel,
      ctaUrl: params.ctaUrl,
    }),
  };
}

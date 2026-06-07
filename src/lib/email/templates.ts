import { SITE_NAME } from "@/lib/constants";
import { getSupportEmail } from "@/lib/email/env";

type EmailLayoutParams = {
  preheader: string;
  headline: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
};

export function renderBrandedEmail({
  preheader,
  headline,
  bodyHtml,
  ctaLabel,
  ctaUrl,
  footerNote,
}: EmailLayoutParams): string {
  const supportEmail = getSupportEmail();
  const ctaBlock =
    ctaLabel && ctaUrl
      ? `<tr>
          <td style="padding:32px 0 8px;">
            <a href="${ctaUrl}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;padding:16px 32px;">
              ${ctaLabel}
            </a>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f5;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e8e8e4;">
            <tr>
              <td style="padding:32px 32px 16px;font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#8a8a86;">
                ${SITE_NAME}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.3;color:#111111;">
                ${headline}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px 0;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#444444;">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaBlock}
            <tr>
              <td style="padding:32px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8a8a86;">
                ${footerNote ?? `Questions? Reply to this email or contact us at <a href="mailto:${supportEmail}" style="color:#111111;">${supportEmail}</a>.`}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderPurchaseWelcomeEmail(params: {
  fullName: string;
  productName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const firstName = params.fullName.trim().split(" ")[0] || "Creator";

  return {
    subject: `Welcome to ${SITE_NAME} — your creator dashboard is ready`,
    html: renderBrandedEmail({
      preheader: "Your purchase is confirmed. Access your 40-Day Creator Development Plan dashboard.",
      headline: `Thank you, ${firstName}`,
      bodyHtml: `
        <p>Your purchase of <strong>${params.productName}</strong> is confirmed.</p>
        <p>Your personalized 40-Day Creator Development Plan will be generated inside your dashboard from your assessment results.</p>
        <p><strong>Getting started:</strong></p>
        <ol style="margin:0;padding-left:20px;">
          <li style="margin-bottom:8px;">Open your dashboard and allow a minute for your plan to generate.</li>
          <li style="margin-bottom:8px;">Start with <strong>Today</strong> to complete your first actionable tasks.</li>
          <li style="margin-bottom:8px;">Track progress across all 40 days at your own pace — no calendar lock.</li>
        </ol>
        <p>Once your plan is ready, you will receive a separate email with your complete 40-Day Creator Development Plan as a PDF attachment.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

export function renderPlanPdfEmail(params: {
  fullName: string;
  planTitle: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const firstName = params.fullName.trim().split(" ")[0] || "Creator";

  return {
    subject: `Your 40-Day Creator Development Plan — ${SITE_NAME}`,
    html: renderBrandedEmail({
      preheader: "Your personalized 40-Day Creator Development Plan PDF is attached.",
      headline: `Your plan is ready, ${firstName}`,
      bodyHtml: `
        <p>Your personalized <strong>${params.planTitle}</strong> has been generated.</p>
        <p>The attached PDF includes your assessment summary, creator archetype and stage, personalized recommendations, and the complete 40-day plan with every day and task.</p>
        <p>Continue tracking progress and completing tasks in your dashboard at any time.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

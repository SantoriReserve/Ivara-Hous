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
        <p>Your purchase of <strong>${params.productName}</strong> is confirmed. Your creator operating system is ready.</p>
        <p>Your personalized 40-Day Creator Development Plan will generate inside your dashboard from your assessment — pitch templates, partnership targets, content assignments, and daily actions included.</p>
        <p><strong>Start here:</strong></p>
        <ol style="margin:0;padding-left:20px;">
          <li style="margin-bottom:8px;">Open your dashboard and allow about a minute for your plan to generate.</li>
          <li style="margin-bottom:8px;">Go to <strong>Today</strong> for your focus, tasks, and first outreach actions.</li>
          <li style="margin-bottom:8px;">Use <strong>Partnerships</strong> and <strong>Pitch Templates</strong> when you are ready to send your first messages.</li>
        </ol>
        <p>When your plan finishes generating, you will receive a separate email with your complete 40-Day Creator Development Plan as a PDF attachment.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

export function renderPurchaseCompleteEmail(params: {
  fullName: string;
  productName: string;
  planTitle: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const firstName = params.fullName.trim().split(" ")[0] || "Creator";

  return {
    subject: `Your ${params.productName} is ready — ${SITE_NAME}`,
    html: renderBrandedEmail({
      preheader:
        "Purchase confirmed. Your dashboard is live and your 40-Day Creator Development Plan PDF is attached.",
      headline: `Thank you, ${firstName}`,
      bodyHtml: `
        <p>Your purchase of <strong>${params.productName}</strong> is confirmed — and your personalized <strong>${params.planTitle}</strong> is attached to this email.</p>
        <p>The PDF includes your assessment summary, creator archetype and stage, readiness scores, strategy roadmap, and the complete 40-day plan with every day and task.</p>
        <p><strong>Inside your dashboard:</strong></p>
        <ul style="margin:0;padding-left:20px;">
          <li style="margin-bottom:8px;"><strong>Today</strong> — daily focus, tasks, and learning insights</li>
          <li style="margin-bottom:8px;"><strong>Partnerships</strong> — location search with real hospitality targets</li>
          <li style="margin-bottom:8px;"><strong>Pitch Templates</strong> — conversion-ready outreach copy</li>
          <li style="margin-bottom:8px;"><strong>Content Ideas</strong> — assignments with production tracking</li>
        </ul>
        <p>Your creator operating system is ready to execute. Open your dashboard to begin Day 1.</p>
      `,
      ctaLabel: "Open Your Dashboard",
      ctaUrl: params.dashboardUrl,
    }),
  };
}

/** @deprecated Use renderPurchaseCompleteEmail — kept for reference only */
export function renderPlanPdfEmail(params: {
  fullName: string;
  planTitle: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  return renderPurchaseCompleteEmail({
    fullName: params.fullName,
    productName: "40-Day Creator Development Plan",
    planTitle: params.planTitle,
    dashboardUrl: params.dashboardUrl,
  });
}

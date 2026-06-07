/**
 * Customer email system verification.
 * Run: npx tsx scripts/verify-email-system.mts
 */
import { config } from "dotenv";
config({ path: ".env.production.local" });
config({ path: ".env.local" });

import { checkEmailDnsHealth } from "../src/lib/email/dns-health";
import {
  getEmailFromAddress,
  getReplyToEmail,
  getSupportEmail,
  isEmailConfigured,
} from "../src/lib/email/env";
import {
  renderContactFormConfirmationEmail,
  renderGeneralCustomerNotificationEmail,
  renderPdfDeliveryEmail,
  renderPurchaseCompleteEmail,
} from "../src/lib/email/templates";

const PRODUCTION_URL = process.env.VERIFY_URL ?? "https://ivara-hous.vercel.app";

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
  const icon = pass ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name} — ${detail}`);
}

record(
  "Resend configured",
  isEmailConfigured(),
  isEmailConfigured() ? "RESEND_API_KEY present" : "RESEND_API_KEY missing"
);

const from = getEmailFromAddress();
record(
  "From address is info@ivarahous.com",
  from.includes("info@ivarahous.com"),
  from
);

record(
  "Support/reply-to addresses",
  getSupportEmail().includes("info@ivarahous.com") &&
    getReplyToEmail().includes("info@ivarahous.com"),
  `${getSupportEmail()} / ${getReplyToEmail()}`
);

try {
  const templates = [
    renderPurchaseCompleteEmail({
      fullName: "Test Creator",
      productName: "40-Day Creator Development Plan",
      planTitle: "Test Creator's 40-Day Creator Plan",
      dashboardUrl: `${PRODUCTION_URL}/dashboard`,
    }),
    renderPdfDeliveryEmail({
      fullName: "Test Creator",
      planTitle: "Test Creator's 40-Day Creator Plan",
      dashboardUrl: `${PRODUCTION_URL}/dashboard`,
    }),
    renderContactFormConfirmationEmail({
      fullName: "Test Creator",
      subject: "General inquiry",
    }),
    renderGeneralCustomerNotificationEmail({
      fullName: "Test Creator",
      title: "Update",
      messageHtml: "<p>Test notification body.</p>",
    }),
  ];

  const allHaveHtml = templates.every((item) => item.html.length > 500 && item.subject.length > 5);
  record("Template render (4 types)", allHaveHtml, `${templates.length} templates generated`);
} catch (error) {
  record(
    "Template render (4 types)",
    false,
    error instanceof Error ? error.message : "Render error"
  );
}

for (const dnsCheck of await checkEmailDnsHealth()) {
  record(dnsCheck.name, dnsCheck.pass, dnsCheck.detail);
}

try {
  const response = await fetch(`${PRODUCTION_URL}/api/verify/email-system`);
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    record(
      "Production /api/verify/email-system",
      false,
      `HTTP ${response.status} — deploy latest build to enable endpoint`
    );
  } else {
    const payload = (await response.json()) as {
      pass?: boolean;
      checks?: Check[];
      deliveryStats?: { totalSent: number; totalFailed: number };
    };

    record(
      "Production /api/verify/email-system",
      response.ok && Boolean(payload.pass),
      response.ok
        ? `HTTP ${response.status}, deliveries: ${payload.deliveryStats?.totalSent ?? 0} sent`
        : `HTTP ${response.status}`
    );

    if (payload.checks) {
      for (const remoteCheck of payload.checks) {
        if (remoteCheck.name === "email_deliveries table") {
          record(`Production: ${remoteCheck.name}`, remoteCheck.pass, remoteCheck.detail);
        }
      }
    }
  }
} catch (error) {
  record(
    "Production /api/verify/email-system",
    false,
    error instanceof Error ? error.message : "Request failed"
  );
}

const passed = checks.filter((check) => check.pass).length;
const total = checks.length;

console.log("\n---");
console.log(`Email verification: ${passed}/${total} checks passed`);

if (passed < total) {
  process.exit(1);
}

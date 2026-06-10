import { createHash } from "node:crypto";
import { formatCurrency, formatDateTime } from "@/lib/admin/admin-format";
import { buildCustomerKey } from "@/lib/admin/admin-repository";
import { ROUTES } from "@/lib/constants";
import { getAssessmentById } from "@/lib/assessment-repository";
import { escapeHtml } from "@/lib/email/escape-html";
import { getOwnerNotificationEmail } from "@/lib/email/env";
import {
  buildOwnerEventDedupKey,
  hasOwnerNotificationBeenSent,
  OWNER_NOTIFICATION_EMAIL_TYPES,
  type OwnerNotificationEmailType,
} from "@/lib/email/owner-notification-repository";
import { sendBrandedEmail, type SendEmailResult } from "@/lib/email/send-email";
import { renderBrandedEmail } from "@/lib/email/templates";
import { pickCreatorApplicationFields } from "@/lib/make-webhook";
import { getPlanByPurchaseId } from "@/lib/plan/plan-repository";
import type { PurchaseRecord } from "@/lib/purchase-schema";
import { getSiteUrl } from "@/lib/stripe";

const PALETTE = {
  muted: "#8a8a86",
  charcoal: "#2a2a2a",
  divider: "#ecece8",
} as const;

export type OwnerNotificationResult =
  | SendEmailResult
  | { sent: false; reason: "duplicate" | "missing_event_id" };

type DetailRow = { label: string; value: string };

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : value != null ? String(value) : "";
}

function absoluteUrl(path: string): string {
  return `${getSiteUrl().replace(/\/$/, "")}${path}`;
}

function truncatePreview(value: string, maxLength = 140): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function buildFallbackEventId(emailType: OwnerNotificationEmailType, payload: string): string {
  return createHash("sha256").update(`${emailType}:${payload}`).digest("hex").slice(0, 24);
}

function renderDetailTable(rows: DetailRow[]): string {
  const items = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0 4px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${PALETTE.muted};vertical-align:top;width:38%;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:10px 0 4px;font-size:15px;line-height:1.6;color:${PALETTE.charcoal};vertical-align:top;">
            ${escapeHtml(row.value || "—")}
          </td>
        </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0;border-top:1px solid ${PALETTE.divider};">
      ${items}
    </table>`;
}

function renderOwnerAlertEmail(params: {
  eyebrow: string;
  preheader: string;
  headline: string;
  rows: DetailRow[];
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
}): string {
  return renderBrandedEmail({
    eyebrow: params.eyebrow,
    preheader: params.preheader,
    headline: params.headline,
    bodyHtml: renderDetailTable(params.rows),
    ctaLabel: params.primaryCtaLabel,
    ctaUrl: params.primaryCtaUrl,
    secondaryCtaLabel: params.secondaryCtaLabel,
    secondaryCtaUrl: params.secondaryCtaUrl,
    footerNote:
      "Internal owner alert — reply only if follow-up is needed before reviewing the dashboard.",
  });
}

async function sendOwnerAlert(params: {
  emailType: OwnerNotificationEmailType;
  subject: string;
  html: string;
  eventId?: string;
  purchaseId?: string;
}): Promise<OwnerNotificationResult> {
  if (params.purchaseId) {
    if (await hasOwnerNotificationBeenSent({ emailType: params.emailType, purchaseId: params.purchaseId })) {
      return { sent: false, reason: "duplicate" };
    }
  } else if (params.eventId) {
    if (await hasOwnerNotificationBeenSent({ emailType: params.emailType, eventId: params.eventId })) {
      return { sent: false, reason: "duplicate" };
    }
  } else {
    return { sent: false, reason: "missing_event_id" };
  }

  const dedupKey = params.eventId
    ? buildOwnerEventDedupKey(params.emailType, params.eventId)
    : null;

  return sendBrandedEmail({
    to: getOwnerNotificationEmail(),
    subject: params.subject,
    html: params.html,
    emailType: params.emailType,
    purchaseId: params.purchaseId,
    attachmentUrl: dedupKey,
  });
}

function formatPlanStatusLabel(status: string | null | undefined): string {
  if (!status) {
    return "Pending activation";
  }
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function notifyOwnerCreatorApplication(params: {
  body: Record<string, unknown>;
  recordId?: string;
}): Promise<OwnerNotificationResult> {
  const fields = pickCreatorApplicationFields(params.body);
  const eventId =
    params.recordId ??
    buildFallbackEventId(
      OWNER_NOTIFICATION_EMAIL_TYPES.creatorApplication,
      `${fields.email}|${fields.fullName}|${fields.instagram}`
    );
  const submittedAt = formatDateTime(new Date().toISOString());

  const html = renderOwnerAlertEmail({
    eyebrow: "Owner Alert",
    preheader: `New creator application from ${fields.fullName || "a creator"}.`,
    headline: "New Creator Application",
    rows: [
      { label: "Name", value: fields.fullName },
      { label: "Email", value: fields.email },
      { label: "Instagram", value: fields.instagram },
      { label: "Niche", value: fields.niche },
      { label: "Location", value: fields.location },
      { label: "Date Submitted", value: submittedAt },
    ],
    primaryCtaLabel: "View Creator CRM",
    primaryCtaUrl: absoluteUrl(ROUTES.adminCreatorCrm),
    secondaryCtaLabel: "View Full Application",
    secondaryCtaUrl: absoluteUrl(ROUTES.adminCreatorCrm),
  });

  return sendOwnerAlert({
    emailType: OWNER_NOTIFICATION_EMAIL_TYPES.creatorApplication,
    subject: `New Creator Application — ${fields.fullName || "Unknown"}`,
    html,
    eventId,
  });
}

export async function notifyOwnerPartnerInquiry(params: {
  source: "partner-with-us" | "creative-partner-application";
  body: Record<string, unknown>;
  recordId?: string;
}): Promise<OwnerNotificationResult> {
  const isPartnerWithUs = params.source === "partner-with-us";
  const companyName = isPartnerWithUs
    ? asString(params.body.propertyName) || "—"
    : asString(params.body.fullName) || "Creative Partner";
  const contactName = isPartnerWithUs
    ? asString(params.body.contactName)
    : asString(params.body.fullName);
  const email = asString(params.body.email);
  const website = isPartnerWithUs
    ? asString(params.body.website)
    : asString(params.body.portfolio);
  const location = asString(params.body.location);
  const submittedAt = formatDateTime(new Date().toISOString());

  const eventId =
    params.recordId ??
    buildFallbackEventId(
      OWNER_NOTIFICATION_EMAIL_TYPES.partnerInquiry,
      `${params.source}|${email}|${companyName}|${contactName}`
    );

  const html = renderOwnerAlertEmail({
    eyebrow: "Owner Alert",
    preheader: `New partner inquiry from ${companyName}.`,
    headline: "New Partner Inquiry",
    rows: [
      { label: "Company", value: companyName },
      { label: "Contact Name", value: contactName },
      { label: "Email", value: email },
      { label: "Website", value: website },
      { label: "Location", value: location },
      { label: "Date Submitted", value: submittedAt },
    ],
    primaryCtaLabel: "View Partner CRM",
    primaryCtaUrl: absoluteUrl(ROUTES.adminPartnerCrm),
    secondaryCtaLabel: "View Inquiry",
    secondaryCtaUrl: absoluteUrl(ROUTES.adminPartnerCrm),
  });

  return sendOwnerAlert({
    emailType: OWNER_NOTIFICATION_EMAIL_TYPES.partnerInquiry,
    subject: `New Partner Inquiry — ${companyName}`,
    html,
    eventId,
  });
}

export async function notifyOwnerContactInquiry(params: {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  recordId?: string;
}): Promise<OwnerNotificationResult> {
  const submittedAt = formatDateTime(new Date().toISOString());
  const eventId =
    params.recordId ??
    buildFallbackEventId(
      OWNER_NOTIFICATION_EMAIL_TYPES.contactInquiry,
      `${params.email}|${params.inquiryType}|${params.message.slice(0, 200)}`
    );

  const html = renderOwnerAlertEmail({
    eyebrow: "Owner Alert",
    preheader: `New contact inquiry from ${params.name}.`,
    headline: "New Contact Inquiry",
    rows: [
      { label: "Name", value: params.name },
      { label: "Email", value: params.email },
      { label: "Inquiry Type", value: params.inquiryType },
      { label: "Message Preview", value: truncatePreview(params.message) },
      { label: "Date Submitted", value: submittedAt },
    ],
    primaryCtaLabel: "View Contact CRM",
    primaryCtaUrl: absoluteUrl(ROUTES.adminContactInquiries),
    secondaryCtaLabel: "Open Inquiry",
    secondaryCtaUrl: absoluteUrl(ROUTES.adminContactInquiries),
  });

  return sendOwnerAlert({
    emailType: OWNER_NOTIFICATION_EMAIL_TYPES.contactInquiry,
    subject: `New Contact Inquiry — ${params.name}`,
    html,
    eventId,
  });
}

export async function notifyOwnerPurchase(purchase: PurchaseRecord): Promise<OwnerNotificationResult> {
  let customerName = purchase.customerEmail.split("@")[0] || "Customer";

  if (purchase.assessmentId) {
    const assessment = await getAssessmentById(purchase.assessmentId);
    if (assessment?.answers.fullName) {
      customerName = assessment.answers.fullName;
    }
  }

  const plan = await getPlanByPurchaseId(purchase.id);
  const planStatus = formatPlanStatusLabel(plan?.status);
  const customerKey = buildCustomerKey(purchase.userId, purchase.id);

  const html = renderOwnerAlertEmail({
    eyebrow: "Owner Alert",
    preheader: `New Creator Development Plan purchase from ${customerName}.`,
    headline: "New Purchase",
    rows: [
      { label: "Customer Name", value: customerName },
      { label: "Customer Email", value: purchase.customerEmail },
      { label: "Amount Paid", value: formatCurrency(purchase.amountCents, purchase.currency) },
      { label: "Purchase Date", value: formatDateTime(purchase.purchasedAt) },
      { label: "Plan Status", value: planStatus },
    ],
    primaryCtaLabel: "View Customer Profile",
    primaryCtaUrl: absoluteUrl(`/admin/customers/${encodeURIComponent(customerKey)}`),
    secondaryCtaLabel: "Open Admin Dashboard",
    secondaryCtaUrl: absoluteUrl(ROUTES.admin),
  });

  return sendOwnerAlert({
    emailType: OWNER_NOTIFICATION_EMAIL_TYPES.purchase,
    subject: "New Purchase — Creator Development Plan",
    html,
    purchaseId: purchase.id,
  });
}

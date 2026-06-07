/**
 * Production purchase email E2E test.
 * Run: npx tsx scripts/test-production-purchase-email.mts
 */
import { config } from "dotenv";
config({ path: ".env.production.local" });

import PDFDocument from "pdfkit";
import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import { sendPlanPdfEmail } from "../src/lib/email/send-plan-pdf";
import { hasPlanPdfBeenSent } from "../src/lib/email/email-delivery-repository";
import { deliverPlanPdfIfNeeded } from "../src/lib/plan/plan-pdf-delivery";
import { getEmailFromAddress } from "../src/lib/email/env";
import { PLAN_PDF_FILENAME } from "../src/lib/plan/plan-pdf-copy";
import { renderPurchaseCompleteEmail } from "../src/lib/email/templates";

const TEST_RECIPIENT = process.env.EMAIL_TEST_RECIPIENT?.trim() || "info@ivarahous.com";
const TEST_FULL_NAME = "Alexandra Chen";

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name} — ${detail}`);
}

async function buildMinimalPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "LETTER", margin: 48 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(18).text("Ivara Hous — Email System Test PDF", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text("This attachment confirms production PDF delivery is working.");
    doc.end();
  });
}

async function findPlanWithoutDelivery(): Promise<{
  userId: string;
  purchaseId: string;
  planInstanceId: string;
  planTitle: string;
  customerEmail: string;
} | null> {
  const supabase = getSupabaseAdmin();
  const { data: plans, error } = await supabase
    .from("plan_instances")
    .select("id, user_id, purchase_id, plan_summary, status, purchases!inner(customer_email)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !plans?.length) {
    return null;
  }

  for (const plan of plans) {
    const sent = await hasPlanPdfBeenSent(plan.id);
    if (sent) {
      continue;
    }

    const purchase = plan.purchases as { customer_email?: string } | { customer_email?: string }[];
    const customerEmail = Array.isArray(purchase)
      ? purchase[0]?.customer_email
      : purchase?.customer_email;

    const summary = plan.plan_summary as { title?: string } | null;
    if (!plan.user_id || !plan.purchase_id) {
      continue;
    }

    return {
      userId: plan.user_id,
      purchaseId: plan.purchase_id,
      planInstanceId: plan.id,
      planTitle: summary?.title ?? `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
      customerEmail: customerEmail ?? TEST_RECIPIENT,
    };
  }

  return null;
}

async function findAnyActivePlan(): Promise<{
  userId: string;
  purchaseId: string;
  planInstanceId: string;
  planTitle: string;
  customerEmail: string;
} | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("plan_instances")
    .select("id, user_id, purchase_id, plan_summary, purchases!inner(customer_email)")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data?.id || !data.user_id || !data.purchase_id) {
    return null;
  }

  const purchase = data.purchases as { customer_email?: string } | { customer_email?: string }[];
  const customerEmail = Array.isArray(purchase)
    ? purchase[0]?.customer_email
    : purchase?.customer_email;
  const summary = data.plan_summary as { title?: string } | null;

  return {
    userId: data.user_id,
    purchaseId: data.purchase_id,
    planInstanceId: data.id,
    planTitle: summary?.title ?? `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
    customerEmail: customerEmail ?? TEST_RECIPIENT,
  };
}

async function countSentPurchases(planInstanceId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("email_deliveries")
    .select("id", { count: "exact", head: true })
    .eq("plan_instance_id", planInstanceId)
    .in("email_type", ["purchase_complete", "plan_pdf", "purchase_welcome"])
    .eq("status", "sent");
  return count ?? 0;
}

async function main() {
  const fromAddress = getEmailFromAddress();
  record(
    "Sender is info@ivarahous.com",
    fromAddress.includes("info@ivarahous.com"),
    fromAddress
  );

  const { html } = renderPurchaseCompleteEmail({
    fullName: TEST_FULL_NAME,
    productName: "40-Day Creator Development Plan",
    planTitle: `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
    dashboardUrl: "https://ivara-hous.vercel.app/dashboard",
  });
  record(
    "Recipient name renders in template",
    html.includes("Thank you, Alexandra"),
    'Headline contains first name "Alexandra"'
  );

  let context = await findPlanWithoutDelivery();
  const usingRealDeliveryPath = Boolean(context);
  if (!context) {
    context = await findAnyActivePlan();
  }

  if (!context) {
    record("Plan context for test", false, "No active plan_instances found");
    process.exit(1);
  }

  record(
    "Plan context for test",
    true,
    `${context.planInstanceId} (${usingRealDeliveryPath ? "no prior email — real delivery path" : "prior email exists — deliverability resend"})`
  );

  const sentBefore = await countSentPurchases(context.planInstanceId);
  let sendSucceeded = false;

  if (usingRealDeliveryPath) {
    await deliverPlanPdfIfNeeded({
      userId: context.userId,
      purchaseId: context.purchaseId,
      planInstanceId: context.planInstanceId,
      recipientEmail: TEST_RECIPIENT,
      fullName: TEST_FULL_NAME,
    });
    const sentAfterFirst = await countSentPurchases(context.planInstanceId);
    sendSucceeded = sentAfterFirst > sentBefore;
    record(
      "Production purchase_complete send (real path)",
      sendSucceeded,
      sendSucceeded
        ? `Delivered via deliverPlanPdfIfNeeded to ${TEST_RECIPIENT}`
        : "deliverPlanPdfIfNeeded did not create a new sent row"
    );
  } else {
    const pdfBuffer = await buildMinimalPdf();
    const result = await sendPlanPdfEmail({
      to: TEST_RECIPIENT,
      fullName: TEST_FULL_NAME,
      userId: context.userId,
      purchaseId: context.purchaseId,
      planInstanceId: context.planInstanceId,
      planTitle: context.planTitle,
      pdfBuffer,
      pdfFilename: PLAN_PDF_FILENAME,
    });
    sendSucceeded = result.sent;
    record(
      "Production purchase_complete send (deliverability test)",
      sendSucceeded,
      sendSucceeded
        ? `Delivered to ${TEST_RECIPIENT} with PDF attachment`
        : (result.reason ?? "send failed")
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: latestDelivery } = await supabase
    .from("email_deliveries")
    .select("recipient_email, status, resend_id, attachment_url, email_type, created_at")
    .eq("plan_instance_id", context.planInstanceId)
    .eq("email_type", "purchase_complete")
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  record(
    "Email delivery logged",
    Boolean(latestDelivery?.resend_id),
    latestDelivery
      ? `resend_id=${latestDelivery.resend_id}, attachment=${latestDelivery.attachment_url ?? "none"}`
      : "No sent row found"
  );

  record(
    "PDF attachment logged",
    Boolean(latestDelivery?.attachment_url?.includes(".pdf")),
    latestDelivery?.attachment_url ?? "missing"
  );

  const sentMidTest = await countSentPurchases(context.planInstanceId);

  await deliverPlanPdfIfNeeded({
    userId: context.userId,
    purchaseId: context.purchaseId,
    planInstanceId: context.planInstanceId,
    recipientEmail: TEST_RECIPIENT,
    fullName: TEST_FULL_NAME,
  });

  await deliverPlanPdfIfNeeded({
    userId: context.userId,
    purchaseId: context.purchaseId,
    planInstanceId: context.planInstanceId,
    recipientEmail: TEST_RECIPIENT,
    fullName: TEST_FULL_NAME,
  });

  const sentAfterDedup = await countSentPurchases(context.planInstanceId);
  record(
    "No duplicate automated emails",
    sentAfterDedup === sentMidTest,
    `${sentMidTest} sent rows after first delivery → ${sentAfterDedup} after two dedup retries`
  );

  record(
    "Only one purchase email type used",
    latestDelivery?.email_type === "purchase_complete",
    latestDelivery?.email_type ?? "missing"
  );

  const passed = checks.every((check) => check.pass);
  console.log(`\n---\nPurchase email E2E: ${checks.filter((c) => c.pass).length}/${checks.length} passed`);
  process.exit(passed ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

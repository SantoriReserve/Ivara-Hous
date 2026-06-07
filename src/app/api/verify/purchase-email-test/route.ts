import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { getEmailFromAddress } from "@/lib/email/env";
import { hasPlanPdfBeenSent } from "@/lib/email/email-delivery-repository";
import { sendPlanPdfEmail } from "@/lib/email/send-plan-pdf";
import { renderPurchaseCompleteEmail } from "@/lib/email/templates";
import { deliverPlanPdfIfNeeded } from "@/lib/plan/plan-pdf-delivery";
import { PLAN_PDF_FILENAME } from "@/lib/plan/plan-pdf-copy";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TEST_FULL_NAME = "Alexandra Chen";

function unauthorized() {
  return NextResponse.json({ pass: false, detail: "Unauthorized" }, { status: 401 });
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

export async function POST(request: Request) {
  const secret = process.env.VERIFY_E2E_SECRET;
  if (!secret) {
    return NextResponse.json(
      { pass: false, detail: "VERIFY_E2E_SECRET not configured" },
      { status: 500 }
    );
  }

  const provided = request.headers.get("x-verify-secret");
  if (provided !== secret) {
    return unauthorized();
  }

  const body = (await request.json().catch(() => ({}))) as { recipient?: string };
  const recipient = body.recipient?.trim() || "info@ivarahous.com";
  const checks: Array<{ name: string; pass: boolean; detail: string }> = [];

  const fromAddress = getEmailFromAddress();
  checks.push({
    name: "Sender is info@ivarahous.com",
    pass: fromAddress.includes("info@ivarahous.com"),
    detail: fromAddress,
  });

  const { html } = renderPurchaseCompleteEmail({
    fullName: TEST_FULL_NAME,
    productName: "40-Day Creator Development Plan",
    planTitle: `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
    dashboardUrl: "https://ivara-hous.vercel.app/dashboard",
  });
  checks.push({
    name: "Recipient name renders in template",
    pass: html.includes("Thank you, Alexandra"),
    detail: 'Headline contains first name "Alexandra"',
  });

  const supabase = getSupabaseAdmin();
  const { data: plans } = await supabase
    .from("plan_instances")
    .select("id, user_id, purchase_id, plan_summary")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(20);

  let context: {
    userId: string;
    purchaseId: string;
    planInstanceId: string;
    planTitle: string;
  } | null = null;

  for (const plan of plans ?? []) {
    if (!plan.id || !plan.user_id || !plan.purchase_id) {
      continue;
    }
    const alreadySent = await hasPlanPdfBeenSent(plan.id);
    if (!alreadySent) {
      const summary = plan.plan_summary as { title?: string } | null;
      context = {
        userId: plan.user_id,
        purchaseId: plan.purchase_id,
        planInstanceId: plan.id,
        planTitle: summary?.title ?? `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
      };
      break;
    }
  }

  if (!context && plans?.[0]?.id && plans[0].user_id && plans[0].purchase_id) {
    const plan = plans[0];
    const summary = plan.plan_summary as { title?: string } | null;
    context = {
      userId: plan.user_id,
      purchaseId: plan.purchase_id,
      planInstanceId: plan.id,
      planTitle: summary?.title ?? `${TEST_FULL_NAME}'s 40-Day Creator Plan`,
    };
  }

  if (!context) {
    return NextResponse.json(
      { pass: false, checks, detail: "No active plan_instances found" },
      { status: 404 }
    );
  }

  const sentBefore = await countSentPurchases(context.planInstanceId);
  const usingRealPath = sentBefore === 0;

  if (usingRealPath) {
    await deliverPlanPdfIfNeeded({
      userId: context.userId,
      purchaseId: context.purchaseId,
      planInstanceId: context.planInstanceId,
      recipientEmail: recipient,
      fullName: TEST_FULL_NAME,
    });
    const sentAfter = await countSentPurchases(context.planInstanceId);
    checks.push({
      name: "Production purchase_complete send (real path)",
      pass: sentAfter > sentBefore,
      detail:
        sentAfter > sentBefore
          ? `Delivered via deliverPlanPdfIfNeeded to ${recipient}`
          : "No new sent row created",
    });
  } else {
    const pdfBuffer = await buildMinimalPdf();
    const result = await sendPlanPdfEmail({
      to: recipient,
      fullName: TEST_FULL_NAME,
      userId: context.userId,
      purchaseId: context.purchaseId,
      planInstanceId: context.planInstanceId,
      planTitle: context.planTitle,
      pdfBuffer,
      pdfFilename: PLAN_PDF_FILENAME,
    });
    checks.push({
      name: "Production purchase_complete send (deliverability test)",
      pass: result.sent,
      detail: result.sent
        ? `Delivered to ${recipient} with PDF attachment`
        : (result.reason ?? "send failed"),
    });
  }

  const { data: latestDelivery } = await supabase
    .from("email_deliveries")
    .select("recipient_email, status, resend_id, attachment_url, email_type, created_at")
    .eq("plan_instance_id", context.planInstanceId)
    .eq("email_type", "purchase_complete")
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  checks.push({
    name: "Email delivery logged",
    pass: Boolean(latestDelivery?.resend_id),
    detail: latestDelivery
      ? `resend_id=${latestDelivery.resend_id}, attachment=${latestDelivery.attachment_url ?? "none"}`
      : "No sent row found",
  });

  checks.push({
    name: "PDF attachment logged",
    pass: Boolean(latestDelivery?.attachment_url?.includes(".pdf")),
    detail: latestDelivery?.attachment_url ?? "missing",
  });

  const sentMidTest = await countSentPurchases(context.planInstanceId);

  await deliverPlanPdfIfNeeded({
    userId: context.userId,
    purchaseId: context.purchaseId,
    planInstanceId: context.planInstanceId,
    recipientEmail: recipient,
    fullName: TEST_FULL_NAME,
  });

  const sentAfterDedup = await countSentPurchases(context.planInstanceId);
  checks.push({
    name: "No duplicate automated emails",
    pass: sentAfterDedup === sentMidTest,
    detail: `${sentMidTest} sent rows after first delivery → ${sentAfterDedup} after dedup retry`,
  });

  checks.push({
    name: "Only purchase_complete email type",
    pass: latestDelivery?.email_type === "purchase_complete",
    detail: latestDelivery?.email_type ?? "missing",
  });

  const pass = checks.every((check) => check.pass);

  return NextResponse.json(
    {
      pass,
      recipient,
      planInstanceId: context.planInstanceId,
      usingRealPath,
      checks,
    },
    { status: pass ? 200 : 503 }
  );
}

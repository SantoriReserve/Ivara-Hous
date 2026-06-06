/**
 * Phase 2 Supabase verification (run locally, do not commit secrets).
 *
 * Usage:
 *   node scripts/verify-phase2-supabase.mjs
 *
 * Requires .env.local with Supabase + Stripe keys populated.
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env.local");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function requireEnv(env, key) {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing ${key} in .env.local`);
  }
  return value;
}

function logStep(title) {
  console.log(`\n=== ${title} ===`);
}

function logPass(message) {
  console.log(`PASS: ${message}`);
}

function logFail(message) {
  console.log(`FAIL: ${message}`);
}

const env = { ...process.env, ...loadEnvFile(ENV_PATH) };

async function main() {
  console.log("Phase 2 Supabase verification");
  console.log(`Env file: ${ENV_PATH}`);

  let supabaseUrl;
  let serviceRoleKey;
  let stripeSecret;
  let webhookSecret;

  try {
    supabaseUrl = requireEnv(env, "NEXT_PUBLIC_SUPABASE_URL");
    requireEnv(env, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
    serviceRoleKey = requireEnv(env, "SUPABASE_SERVICE_ROLE_KEY");
    stripeSecret = env.STRIPE_SECRET_KEY || "";
    webhookSecret = env.STRIPE_WEBHOOK_SECRET || "";
  } catch (error) {
    logFail(error.message);
    console.log("\nAdd Supabase keys to .env.local, then re-run this script.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Connection test
  logStep("1. Supabase connection test");
  const { error: connectionError } = await supabase.from("assessments").select("id").limit(1);
  if (connectionError) {
    logFail(connectionError.message);
    process.exit(1);
  }
  logPass(`Connected to ${supabaseUrl}`);

  const assessmentId = crypto.randomUUID();
  const purchaseSessionId = `cs_test_verify_${Date.now()}`;
  const testEmail = `verify-${Date.now()}@example.com`;
  const submittedAt = new Date().toISOString();

  // 2. Assessment write test
  logStep("2. Assessment write test");
  const assessmentRow = {
    id: assessmentId,
    email: testEmail,
    full_name: "Phase 2 Verify User",
    schema_version: "1.0.0",
    source: "creator-development-assessment",
    answers: {
      fullName: "Phase 2 Verify User",
      email: testEmail,
      location: "Test City",
      niche: "Luxury travel",
      followerCount: "5k-25k",
      travelExperience: "Verification test",
      contentStyle: "Verification test",
      goals: "Verification test",
      dreamPartnerships: "Verification test",
      biggestChallenge: "Verification test",
      desiredOutcome: "Verification test",
    },
    analysis: {
      scores: {
        creatorReadiness: 70,
        portfolioStrength: 70,
        contentQuality: 70,
        partnershipPotential: 70,
        luxuryTravelAlignment: 70,
      },
      scoreExplanations: {
        creatorReadiness: "Verification test",
        portfolioStrength: "Verification test",
        contentQuality: "Verification test",
        partnershipPotential: "Verification test",
        luxuryTravelAlignment: "Verification test",
      },
      preview: {
        currentCreatorStage: "Emerging",
        creatorArchetype: "Verify",
        idealPartnershipTier: "Boutique",
        topStrengths: ["A", "B", "C"],
        growthOpportunities: ["A", "B", "C"],
        estimatedTimelineToFirstHostedStay: "3-6 months",
        recommendedNextStep: "Verification test",
        priorityFocusAreas: ["A", "B", "C"],
      },
      developmentFoundation: {
        creatorStage: "Emerging",
        creatorArchetype: "Verify",
        idealPartnershipTier: "Boutique",
        priorityFocusAreas: ["A", "B", "C"],
        portfolioDevelopmentPriority: "Verification test",
        outreachReadiness: "moderate",
        contentConsistencyLevel: "moderate",
        hospitalityExperienceLevel: "low",
        estimatedHostedStayTimeline: "3-6 months",
      },
      foundation: {
        creatorProfileSummary: "Verification test",
        positioningStatement: "Verification test",
        nicheAlignment: "Verification test",
        audienceProfile: "Verification test",
        contentPillars: ["A", "B", "C"],
        portfolioGaps: ["A", "B"],
        planGenerationSeed: {
          primaryGoal: "Verification test",
          secondaryGoals: ["A"],
          constraints: ["A"],
          recommendedPlanFocus: ["A", "B"],
          suggestedMilestones: [
            { milestone: "M1", targetWindow: "Week 1" },
            { milestone: "M2", targetWindow: "Week 4" },
          ],
        },
        developmentPriorities: [
          { area: "Portfolio", priority: "high", rationale: "Verification test" },
          { area: "Outreach", priority: "medium", rationale: "Verification test" },
        ],
      },
      extensions: {
        contentStrategy: null,
        portfolioRoadmap: null,
        outreachSystem: null,
        planProgress: null,
      },
    },
    payment_status: "free",
    submitted_at: submittedAt,
  };

  const { data: assessmentData, error: assessmentError } = await supabase
    .from("assessments")
    .insert(assessmentRow)
    .select("*")
    .single();

  if (assessmentError) {
    logFail(assessmentError.message);
    process.exit(1);
  }

  logPass(`Assessment inserted (id: ${assessmentData.id}, payment_status: ${assessmentData.payment_status})`);
  console.log(JSON.stringify(assessmentData, null, 2));

  // 3. Purchase write test (mirrors webhook repository logic)
  logStep("3. Purchase write test");
  const purchaseRow = {
    assessment_id: assessmentId,
    customer_email: testEmail,
    stripe_customer_id: "cus_verify_test",
    stripe_checkout_session_id: purchaseSessionId,
    stripe_payment_intent_id: null,
    product_slug: "40-day-creator-development-plan",
    amount_cents: 0,
    currency: "usd",
    status: "completed",
    purchased_at: submittedAt,
    updated_at: new Date().toISOString(),
  };

  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .upsert(purchaseRow, { onConflict: "stripe_checkout_session_id" })
    .select("*")
    .single();

  if (purchaseError) {
    logFail(purchaseError.message);
    process.exit(1);
  }

  logPass(`Purchase upserted (id: ${purchaseData.id}, assessment_id: ${purchaseData.assessment_id})`);
  console.log(JSON.stringify(purchaseData, null, 2));

  // 4. payment_status free -> paid
  logStep("4. Assessment payment_status update (webhook behavior)");
  const { error: updateError } = await supabase
    .from("assessments")
    .update({ payment_status: "paid" })
    .eq("id", assessmentId);

  if (updateError) {
    logFail(updateError.message);
    process.exit(1);
  }

  const { data: updatedAssessment, error: readError } = await supabase
    .from("assessments")
    .select("id, payment_status")
    .eq("id", assessmentId)
    .single();

  if (readError || updatedAssessment.payment_status !== "paid") {
    logFail(readError?.message ?? `Expected payment_status=paid, got ${updatedAssessment?.payment_status}`);
    process.exit(1);
  }

  logPass(`Assessment payment_status updated to "${updatedAssessment.payment_status}"`);

  // 5. Optional HTTP webhook test
  logStep("5. Stripe webhook HTTP test");
  if (!stripeSecret || !webhookSecret) {
    console.log("SKIP: STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not set in .env.local");
    console.log("Business logic above mirrors webhook DB writes.");
    process.exit(0);
  }

  const stripe = new Stripe(stripeSecret);
  const mockSession = {
    id: purchaseSessionId,
    object: "checkout.session",
    status: "complete",
    payment_status: "no_payment_required",
    currency: "usd",
    amount_total: 0,
    created: Math.floor(Date.now() / 1000),
    customer: "cus_verify_test",
    customer_details: { email: testEmail },
    customer_email: testEmail,
    payment_intent: null,
    metadata: {
      productSlug: "40-day-creator-development-plan",
      assessmentId,
    },
  };

  const payload = JSON.stringify({
    id: `evt_verify_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: { object: mockSession },
  });

  const signature = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });

  const siteUrl = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/stripe/webhook`;

  console.log(`POST ${webhookUrl}`);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const body = await response.text();
  if (response.status !== 200) {
    logFail(`Webhook returned ${response.status}: ${body}`);
    console.log("Start the app first: npm run dev");
    process.exit(1);
  }

  logPass(`Webhook endpoint returned 200 (${body})`);
}

main().catch((error) => {
  logFail(error.message);
  process.exit(1);
});

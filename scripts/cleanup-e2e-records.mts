/**
 * Safe cleanup for automated E2E / QA records only.
 *
 * Dry run (default):
 *   npx tsx scripts/cleanup-e2e-records.mts
 *
 * Delete after review:
 *   npx tsx scripts/cleanup-e2e-records.mts --confirm
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env.production.local" });

import { getSupabaseAdmin } from "../src/lib/supabase/admin";
import {
  isAutomatedTestAssessment,
  isAutomatedTestEmail,
} from "../src/lib/admin/admin-test-data";

const confirm = process.argv.includes("--confirm");

type PurchaseRow = {
  id: string;
  customer_email: string;
  assessment_id: string | null;
  user_id: string | null;
};

type AssessmentRow = {
  id: string;
  email: string;
  full_name: string;
};

async function listAuthUsers() {
  const supabase = getSupabaseAdmin();
  const users: Array<{ id: string; email: string | null }> = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new Error(`Failed to list auth users: ${error.message}`);
    }
    for (const user of data.users) {
      users.push({ id: user.id, email: user.email ?? null });
    }
    if (data.users.length < 200) {
      break;
    }
    page += 1;
  }

  return users;
}

async function main() {
  const supabase = getSupabaseAdmin();

  const [{ data: purchases }, { data: assessments }] = await Promise.all([
    supabase
      .from("purchases")
      .select("id, customer_email, assessment_id, user_id"),
    supabase.from("assessments").select("id, email, full_name"),
  ]);

  const testPurchases = ((purchases ?? []) as PurchaseRow[]).filter((row) =>
    isAutomatedTestEmail(row.customer_email)
  );
  const testAssessments = ((assessments ?? []) as AssessmentRow[]).filter((row) =>
    isAutomatedTestAssessment({ email: row.email, fullName: row.full_name })
  );
  const authUsers = await listAuthUsers();
  const testAuthUsers = authUsers.filter((user) => isAutomatedTestEmail(user.email));

  console.log("\nAutomated E2E cleanup preview");
  console.log("================================");
  console.log(`Test purchases:    ${testPurchases.length}`);
  console.log(`Test assessments:  ${testAssessments.length}`);
  console.log(`Test auth users:   ${testAuthUsers.length}`);

  if (testPurchases.length) {
    console.log("\nPurchases:");
    for (const row of testPurchases) {
      console.log(`  - ${row.id} · ${row.customer_email}`);
    }
  }

  if (testAssessments.length) {
    console.log("\nAssessments:");
    for (const row of testAssessments) {
      console.log(`  - ${row.id} · ${row.email} · ${row.full_name}`);
    }
  }

  if (testAuthUsers.length) {
    console.log("\nAuth users:");
    for (const row of testAuthUsers) {
      console.log(`  - ${row.id} · ${row.email}`);
    }
  }

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to delete these records.");
    return;
  }

  console.log("\nDeleting automated records...");

  for (const purchase of testPurchases) {
    const { error } = await supabase.from("purchases").delete().eq("id", purchase.id);
    if (error) {
      console.error(`Failed to delete purchase ${purchase.id}: ${error.message}`);
    }
  }

  for (const assessment of testAssessments) {
    const { error } = await supabase.from("assessments").delete().eq("id", assessment.id);
    if (error) {
      console.error(`Failed to delete assessment ${assessment.id}: ${error.message}`);
    }
  }

  for (const user of testAuthUsers) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`Failed to delete auth user ${user.email}: ${error.message}`);
    }
  }

  console.log("Cleanup complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

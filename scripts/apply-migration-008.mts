/**
 * Verifies Migration 008 is applied. Run SQL in Supabase SQL Editor first.
 * Then: npx tsx scripts/apply-migration-008.mts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.production.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tables = ["creator_applications", "partner_inquiries", "contact_inquiries"] as const;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.production.local"
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const missing: string[] = [];

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error?.message.toLowerCase().includes("does not exist")) {
      missing.push(table);
    } else if (error) {
      console.error(`Check failed for ${table}:`, error.message);
      process.exit(1);
    }
  }

  if (missing.length) {
    console.log("Migration 008 NOT applied yet.\n");
    console.log("Missing tables:", missing.join(", "));
    console.log("\nRun this SQL in Supabase → SQL Editor:\n");
    console.log(
      readFileSync(join(process.cwd(), "supabase/migrations/008_form_submissions_crm.sql"), "utf8")
    );
    process.exit(1);
  }

  console.log("PASS — CRM tables exist and are accessible.");
  process.exit(0);
}

main();

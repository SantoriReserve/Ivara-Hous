/**
 * Verifies Migration 006 is applied. Run SQL in Supabase SQL Editor first.
 * Then: npx tsx scripts/apply-migration-006.mts
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.production.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.production.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { error } = await supabase.from("content_daily_pins").select("id").limit(1);

  if (error?.message.toLowerCase().includes("does not exist")) {
    console.log("Migration 006 NOT applied yet.\n");
    console.log("Run this SQL in Supabase → SQL Editor:\n");
    console.log(readFileSync(join(process.cwd(), "supabase/migrations/006_content_daily_pins.sql"), "utf8"));
    process.exit(1);
  }

  if (error) {
    console.error("Check failed:", error.message);
    process.exit(1);
  }

  console.log("PASS — content_daily_pins table exists and is accessible.");
  process.exit(0);
}

main();

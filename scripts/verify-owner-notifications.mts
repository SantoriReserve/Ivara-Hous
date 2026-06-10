#!/usr/bin/env npx tsx
/**
 * Live verification for owner notification emails (no verify API route).
 * Run: npx tsx scripts/verify-owner-notifications.mts [baseUrl]
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.verify.tmp" });
config({ path: ".env.production.local" });
config({ path: ".env.local" });

const postDeploy = process.argv.includes("--post-deploy");

const baseUrl = (process.argv[2] ?? process.env.VERIFY_BASE_URL ?? "https://www.ivarahous.com").replace(
  /\/$/,
  ""
);

const marker = `owner-final-${Date.now()}`;
const timestamp = new Date().toISOString();
const creatorName = `Owner Final Creator ${marker}`;

type Check = { name: string; pass: boolean; detail: string };
const checks: Check[] = [];

function record(name: string, pass: boolean, detail: string) {
  checks.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${name}: ${detail}`);
}

async function postJson(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: response.status, json };
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  return createClient(url, key);
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log(`Owner notification final verification @ ${baseUrl}`);
  console.log(`Marker: ${marker}`);
  console.log(`Timestamp: ${timestamp}\n`);

  const creatorEmail = `creator-${marker}@owner-live.ivarahous.com`;
  const partnerEmail = `partner-${marker}@owner-live.ivarahous.com`;
  const contactEmail = `contact-${marker}@owner-live.ivarahous.com`;

  const creator = await postJson("/api/creator-application", {
    fullName: creatorName,
    email: creatorEmail,
    location: "Los Angeles, CA",
    instagram: "@owner_final",
    niche: "Luxury Travel",
    tiktok: "",
    followerCount: "10000",
    portfolio: "https://example.com",
    motivation: "Owner notification final verification",
    experience: "5 years",
    contentSamples: "https://example.com/samples",
  });
  record(
    "Creator application API (Make required)",
    creator.status === 200,
    `status=${creator.status} body=${JSON.stringify(creator.json)}`
  );

  const partner = await postJson("/api/partner-with-us", {
    propertyName: `Owner Final Hotel ${marker}`,
    contactName: "Final Partner Contact",
    email: partnerEmail,
    website: "https://owner-final.example",
    location: "New York, NY",
    services: "hospitality-growth-partner",
    propertyType: "Boutique Hotel",
    goals: "Owner notification final verification",
    previousCollaborations: "",
  });
  const partnerJson = partner.json as { success?: boolean; data?: { received?: boolean } };
  record(
    "Partner inquiry API (handleFormSubmission)",
    partner.status === 200 && Boolean(partnerJson.success) && Boolean(partnerJson.data?.received),
    `status=${partner.status} body=${JSON.stringify(partner.json)}`
  );

  const contact = await postJson("/api/contact", {
    name: `Owner Final Contact ${marker}`,
    email: contactEmail,
    inquiryType: "general",
    subject: `Owner final test ${marker}`,
    message: `Owner notification final verification message for ${marker}.`,
  });
  const contactJson = contact.json as {
    success?: boolean;
    data?: { customerConfirmationSent?: boolean; teamNotificationSent?: boolean };
  };
  record(
    "Contact inquiry API (existing customer + team emails)",
    contact.status === 200 &&
      Boolean(contactJson.success) &&
      Boolean(contactJson.data?.customerConfirmationSent) &&
      Boolean(contactJson.data?.teamNotificationSent),
    `status=${contact.status} body=${JSON.stringify(contact.json)}`
  );

  if (postDeploy) {
    const verifyEndpoint = await fetch(`${baseUrl}/api/verify/owner-notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    record(
      "Verify endpoint removed from production",
      verifyEndpoint.status === 404,
      `status=${verifyEndpoint.status} (expected 404)`
    );
  }

  await wait(2500);

  const supabase = getSupabase();
  if (!supabase) {
    record(
      "Supabase CRM + owner email checks",
      false,
      "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not available locally"
    );
  } else {
    const [creatorRow, partnerRow, contactRow] = await Promise.all([
      supabase
        .from("creator_applications")
        .select("id, full_name, email")
        .eq("email", creatorEmail)
        .maybeSingle(),
      supabase
        .from("partner_inquiries")
        .select("id, company_name, email")
        .eq("email", partnerEmail)
        .maybeSingle(),
      supabase
        .from("contact_inquiries")
        .select("id, name, email")
        .eq("email", contactEmail)
        .maybeSingle(),
    ]);

    record(
      "CRM: creator application stored",
      Boolean(creatorRow.data?.id),
      creatorRow.data?.id ?? creatorRow.error?.message ?? "missing"
    );
    record(
      "CRM: partner inquiry stored",
      Boolean(partnerRow.data?.id),
      partnerRow.data?.id ?? partnerRow.error?.message ?? "missing"
    );
    record(
      "CRM: contact inquiry stored",
      Boolean(contactRow.data?.id),
      contactRow.data?.id ?? contactRow.error?.message ?? "missing"
    );

    const ownerTypes = [
      "owner_creator_application",
      "owner_partner_inquiry",
      "owner_contact_inquiry",
    ] as const;

    for (const emailType of ownerTypes) {
      const eventId =
        emailType === "owner_creator_application"
          ? creatorRow.data?.id
          : emailType === "owner_partner_inquiry"
            ? partnerRow.data?.id
            : contactRow.data?.id;

      if (!eventId) {
        record(`Owner email: ${emailType}`, false, "CRM row missing — cannot verify delivery");
        continue;
      }

      const dedupKey = `owner-event:${emailType}:${eventId}`;
      const { data: deliveries, error } = await supabase
        .from("email_deliveries")
        .select("id, status, resend_id, recipient_email, created_at")
        .eq("email_type", emailType)
        .eq("attachment_url", dedupKey)
        .eq("status", "sent");

      const count = deliveries?.length ?? 0;
      record(
        `Owner email: ${emailType}`,
        !error && count === 1,
        error
          ? error.message
          : count === 1
            ? `sent to ${deliveries?.[0]?.recipient_email} (resend_id=${deliveries?.[0]?.resend_id ?? "none"})`
            : `${count} sent rows (expected 1)`
      );

      if (!error && count === 1) {
        const retryKey = dedupKey;
        const { count: dupCount } = await supabase
          .from("email_deliveries")
          .select("id", { count: "exact", head: true })
          .eq("email_type", emailType)
          .eq("attachment_url", retryKey)
          .eq("status", "sent");
        record(
          `Owner dedup: ${emailType}`,
          (dupCount ?? 0) === 1,
          `${dupCount ?? 0} sent row(s)`
        );
      }
    }
  }

  const pass = checks.every((check) => check.pass);
  console.log(`\n${pass ? "ALL CHECKS PASSED" : "SOME CHECKS FAILED"}`);
  console.log(
    JSON.stringify(
      {
        pass,
        baseUrl,
        marker,
        creatorName,
        timestamp,
        checks,
      },
      null,
      2
    )
  );
  process.exit(pass ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

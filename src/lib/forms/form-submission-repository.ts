import { pickCreatorApplicationFields } from "@/lib/make-webhook";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type FormStorageResult = {
  stored: boolean;
  table: string;
  id?: string;
  error?: string;
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : value != null ? String(value) : "";
}

export async function recordCreatorApplication(
  body: Record<string, unknown>
): Promise<FormStorageResult> {
  const fields = pickCreatorApplicationFields(body);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("creator_applications")
    .insert({
      full_name: fields.fullName,
      email: fields.email,
      location: fields.location || null,
      instagram: fields.instagram || null,
      niche: fields.niche || null,
      source: "creator-application",
      payload: fields,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[crm] Failed to store creator application:", error.message);
    return { stored: false, table: "creator_applications", error: error.message };
  }

  return { stored: true, table: "creator_applications", id: data.id };
}

export async function recordPartnerInquiry(
  source: "partner-with-us" | "creative-partner-application",
  body: Record<string, unknown>
): Promise<FormStorageResult> {
  const supabase = getSupabaseAdmin();

  if (source === "partner-with-us") {
    const { data, error } = await supabase
      .from("partner_inquiries")
      .insert({
        company_name: asString(body.propertyName) || "—",
        contact_name: asString(body.contactName) || "—",
        email: asString(body.email),
        website: asString(body.website) || null,
        location: asString(body.location) || null,
        inquiry_type: asString(body.services) || asString(body.propertyType) || "partnership",
        source,
        payload: body,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[crm] Failed to store partner inquiry:", error.message);
      return { stored: false, table: "partner_inquiries", error: error.message };
    }

    return { stored: true, table: "partner_inquiries", id: data.id };
  }

  const { data, error } = await supabase
    .from("partner_inquiries")
    .insert({
      company_name: asString(body.fullName) || "Creative Partner",
      contact_name: asString(body.fullName) || "—",
      email: asString(body.email),
      website: asString(body.portfolio) || null,
      location: asString(body.location) || null,
      inquiry_type: asString(body.discipline) || "creative-partner",
      source,
      payload: body,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[crm] Failed to store creative partner application:", error.message);
    return { stored: false, table: "partner_inquiries", error: error.message };
  }

  return { stored: true, table: "partner_inquiries", id: data.id };
}

export async function recordContactInquiry(
  body: Record<string, unknown>
): Promise<FormStorageResult> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("contact_inquiries")
    .insert({
      name: asString(body.name),
      email: asString(body.email),
      inquiry_type: asString(body.inquiryType),
      subject: asString(body.subject),
      message: asString(body.message),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[crm] Failed to store contact inquiry:", error.message);
    return { stored: false, table: "contact_inquiries", error: error.message };
  }

  return { stored: true, table: "contact_inquiries", id: data.id };
}

export async function findCreatorApplicationByEmail(
  email: string
): Promise<{ id: string; email: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("creator_applications")
    .select("id, email")
    .eq("email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function findPartnerInquiryByEmail(
  email: string
): Promise<{ id: string; email: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("partner_inquiries")
    .select("id, email")
    .eq("email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export async function findContactInquiryByEmail(
  email: string
): Promise<{ id: string; email: string } | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("id, email")
    .eq("email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

import type { AdminDataScope } from "@/lib/admin/admin-test-data";
import { isAutomatedTestEmail, isAutomatedTestName } from "@/lib/admin/admin-test-data";
import type {
  AdminContactInquiryRow,
  AdminCreatorApplicationRow,
  AdminPartnerInquiryRow,
  AdminQueryOptions,
  ContactInquiryStatus,
  CreatorApplicationStatus,
  PartnerInquiryStatus,
} from "@/lib/admin/admin-types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

function toScope(options?: AdminQueryOptions): AdminDataScope {
  return { includeTestData: options?.includeTestData ?? false };
}

function filterCrmRows<T extends { email: string; name?: string }>(
  rows: T[],
  scope: AdminDataScope
): T[] {
  if (scope.includeTestData) {
    return rows;
  }
  return rows.filter(
    (row) => !isAutomatedTestEmail(row.email) && !isAutomatedTestName(row.name)
  );
}

export async function getAdminCreatorApplications(
  options?: AdminQueryOptions
): Promise<AdminCreatorApplicationRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("creator_applications")
      .select("id, full_name, email, instagram, niche, location, submitted_at, status, notes, source")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[crm] Failed to load creator applications:", error.message);
      return [];
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      name: row.full_name,
      email: row.email,
      instagram: row.instagram,
      niche: row.niche,
      location: row.location,
      submittedAt: row.submitted_at,
      status: row.status as CreatorApplicationStatus,
      notes: row.notes,
      source: row.source,
    }));

    return filterCrmRows(rows, toScope(options));
  } catch (error) {
    console.error("[crm] getAdminCreatorApplications exception:", error);
    return [];
  }
}

export async function getAdminPartnerInquiries(
  options?: AdminQueryOptions
): Promise<AdminPartnerInquiryRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("partner_inquiries")
      .select(
        "id, company_name, contact_name, email, website, location, inquiry_type, submitted_at, status, notes, source"
      )
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[crm] Failed to load partner inquiries:", error.message);
      return [];
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      companyName: row.company_name,
      contactName: row.contact_name,
      email: row.email,
      website: row.website,
      location: row.location,
      inquiryType: row.inquiry_type,
      submittedAt: row.submitted_at,
      status: row.status as PartnerInquiryStatus,
      notes: row.notes,
      source: row.source,
    }));

    const scope = toScope(options);
    if (scope.includeTestData) {
      return rows;
    }
    return rows.filter(
      (row) =>
        !isAutomatedTestEmail(row.email) &&
        !isAutomatedTestName(row.contactName) &&
        !isAutomatedTestName(row.companyName)
    );
  } catch (error) {
    console.error("[crm] getAdminPartnerInquiries exception:", error);
    return [];
  }
}

export async function getAdminContactInquiries(
  options?: AdminQueryOptions
): Promise<AdminContactInquiryRow[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("contact_inquiries")
      .select("id, name, email, inquiry_type, subject, message, submitted_at, status, notes")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("[crm] Failed to load contact inquiries:", error.message);
      return [];
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      inquiryType: row.inquiry_type,
      subject: row.subject,
      message: row.message,
      submittedAt: row.submitted_at,
      status: row.status as ContactInquiryStatus,
      notes: row.notes,
    }));

    return filterCrmRows(rows, toScope(options));
  } catch (error) {
    console.error("[crm] getAdminContactInquiries exception:", error);
    return [];
  }
}

export async function updateCreatorApplicationStatus(params: {
  id: string;
  status: CreatorApplicationStatus;
  notes?: string;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("creator_applications")
      .update({
        status: params.status,
        notes: params.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      console.error("[crm] updateCreatorApplicationStatus failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[crm] updateCreatorApplicationStatus exception:", error);
    return false;
  }
}

export async function updatePartnerInquiryStatus(params: {
  id: string;
  status: PartnerInquiryStatus;
  notes?: string;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("partner_inquiries")
      .update({
        status: params.status,
        notes: params.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      console.error("[crm] updatePartnerInquiryStatus failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[crm] updatePartnerInquiryStatus exception:", error);
    return false;
  }
}

export async function updateContactInquiryStatus(params: {
  id: string;
  status: ContactInquiryStatus;
  notes?: string;
}): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("contact_inquiries")
      .update({
        status: params.status,
        notes: params.notes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      console.error("[crm] updateContactInquiryStatus failed:", error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[crm] updateContactInquiryStatus exception:", error);
    return false;
  }
}

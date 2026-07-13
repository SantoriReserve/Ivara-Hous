import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type AdminCustomerNote = {
  id: string;
  customerKey: string;
  userId: string | null;
  purchaseId: string | null;
  body: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerTag = {
  id: string;
  customerKey: string;
  userId: string | null;
  purchaseId: string | null;
  tag: string;
  createdAt: string;
};

function mapNote(row: Record<string, unknown>): AdminCustomerNote {
  return {
    id: String(row.id),
    customerKey: String(row.customer_key),
    userId: row.user_id ? String(row.user_id) : null,
    purchaseId: row.purchase_id ? String(row.purchase_id) : null,
    body: String(row.body),
    createdBy: String(row.created_by ?? "admin"),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapTag(row: Record<string, unknown>): AdminCustomerTag {
  return {
    id: String(row.id),
    customerKey: String(row.customer_key),
    userId: row.user_id ? String(row.user_id) : null,
    purchaseId: row.purchase_id ? String(row.purchase_id) : null,
    tag: String(row.tag),
    createdAt: String(row.created_at),
  };
}

export async function listCustomerNotes(customerKey: string): Promise<AdminCustomerNote[]> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from("admin_customer_notes")
      .select("*")
      .eq("customer_key", customerKey)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[admin] listCustomerNotes failed:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapNote(row as Record<string, unknown>));
  } catch (error) {
    console.error("[admin] listCustomerNotes exception:", error);
    return [];
  }
}

export async function createCustomerNote(params: {
  customerKey: string;
  userId?: string | null;
  purchaseId?: string | null;
  body: string;
  createdBy?: string;
}): Promise<AdminCustomerNote | null> {
  const body = params.body.trim();
  if (!body) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_customer_notes")
      .insert({
        customer_key: params.customerKey,
        user_id: params.userId ?? null,
        purchase_id: params.purchaseId ?? null,
        body,
        created_by: params.createdBy ?? "admin",
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      console.error("[admin] createCustomerNote failed:", error.message);
      return null;
    }

    return mapNote(data as Record<string, unknown>);
  } catch (error) {
    console.error("[admin] createCustomerNote exception:", error);
    return null;
  }
}

export async function deleteCustomerNote(noteId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_customer_notes").delete().eq("id", noteId);
  if (error) {
    console.error("[admin] deleteCustomerNote failed:", error.message);
    return false;
  }
  return true;
}

export async function listCustomerTags(customerKey: string): Promise<AdminCustomerTag[]> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from("admin_customer_tags")
      .select("*")
      .eq("customer_key", customerKey)
      .order("tag", { ascending: true });

    if (error) {
      console.error("[admin] listCustomerTags failed:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapTag(row as Record<string, unknown>));
  } catch (error) {
    console.error("[admin] listCustomerTags exception:", error);
    return [];
  }
}

export async function listAllCustomerTags(): Promise<AdminCustomerTag[]> {
  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from("admin_customer_tags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      console.error("[admin] listAllCustomerTags failed:", error.message);
      return [];
    }

    return (data ?? []).map((row) => mapTag(row as Record<string, unknown>));
  } catch (error) {
    console.error("[admin] listAllCustomerTags exception:", error);
    return [];
  }
}

export async function addCustomerTag(params: {
  customerKey: string;
  userId?: string | null;
  purchaseId?: string | null;
  tag: string;
}): Promise<AdminCustomerTag | null> {
  const tag = params.tag.trim();
  if (!tag) {
    return null;
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_customer_tags")
      .upsert(
        {
          customer_key: params.customerKey,
          user_id: params.userId ?? null,
          purchase_id: params.purchaseId ?? null,
          tag,
        },
        { onConflict: "customer_key,tag" }
      )
      .select("*")
      .single();

    if (error) {
      console.error("[admin] addCustomerTag failed:", error.message);
      return null;
    }

    return mapTag(data as Record<string, unknown>);
  } catch (error) {
    console.error("[admin] addCustomerTag exception:", error);
    return null;
  }
}

export async function removeCustomerTag(tagId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("admin_customer_tags").delete().eq("id", tagId);
  if (error) {
    console.error("[admin] removeCustomerTag failed:", error.message);
    return false;
  }
  return true;
}

export async function getTagsByCustomerKeys(
  customerKeys: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!customerKeys.length) {
    return map;
  }

  const supabase = getSupabaseAdmin();
  try {
    const { data, error } = await supabase
      .from("admin_customer_tags")
      .select("customer_key, tag")
      .in("customer_key", customerKeys);

    if (error) {
      console.error("[admin] getTagsByCustomerKeys failed:", error.message);
      return map;
    }

    for (const row of data ?? []) {
      const key = String(row.customer_key);
      const existing = map.get(key) ?? [];
      existing.push(String(row.tag));
      map.set(key, existing);
    }
  } catch (error) {
    console.error("[admin] getTagsByCustomerKeys exception:", error);
  }

  return map;
}

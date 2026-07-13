"use server";

import { requireAdminUser } from "@/lib/admin/admin-auth";
import {
  addCustomerTag,
  createCustomerNote,
  deleteCustomerNote,
  removeCustomerTag,
} from "@/lib/admin/customer-crm-repository";
import { getAdminCustomerDetail } from "@/lib/admin/admin-repository";
import { revalidatePath } from "next/cache";

export type AdminCrmActionResult =
  | { success: true }
  | { success: false; error: string };

export async function adminAddCustomerNoteAction(formData: FormData): Promise<AdminCrmActionResult> {
  const session = await requireAdminUser();
  const customerKey = String(formData.get("customerKey") ?? "");
  const body = String(formData.get("body") ?? "");
  if (!customerKey || !body.trim()) {
    return { success: false, error: "Note cannot be empty." };
  }

  const customer = await getAdminCustomerDetail(customerKey, { includeTestData: true });
  if (!customer) {
    return { success: false, error: "Customer not found." };
  }

  const note = await createCustomerNote({
    customerKey,
    userId: customer.userId,
    purchaseId: customer.purchaseId,
    body,
    createdBy: session.email || "admin",
  });

  if (!note) {
    return { success: false, error: "Could not save note. Apply migration 012 if tables are missing." };
  }

  revalidatePath(`/admin/customers/${encodeURIComponent(customerKey)}`);
  return { success: true };
}

export async function adminDeleteCustomerNoteAction(
  formData: FormData
): Promise<AdminCrmActionResult> {
  await requireAdminUser();
  const noteId = String(formData.get("noteId") ?? "");
  const customerKey = String(formData.get("customerKey") ?? "");
  if (!noteId) {
    return { success: false, error: "Missing note." };
  }
  const ok = await deleteCustomerNote(noteId);
  if (!ok) {
    return { success: false, error: "Could not delete note." };
  }
  if (customerKey) {
    revalidatePath(`/admin/customers/${encodeURIComponent(customerKey)}`);
  }
  return { success: true };
}

export async function adminAddCustomerTagAction(formData: FormData): Promise<AdminCrmActionResult> {
  await requireAdminUser();
  const customerKey = String(formData.get("customerKey") ?? "");
  const tag = String(formData.get("tag") ?? "");
  if (!customerKey || !tag.trim()) {
    return { success: false, error: "Tag cannot be empty." };
  }

  const customer = await getAdminCustomerDetail(customerKey, { includeTestData: true });
  if (!customer) {
    return { success: false, error: "Customer not found." };
  }

  const created = await addCustomerTag({
    customerKey,
    userId: customer.userId,
    purchaseId: customer.purchaseId,
    tag,
  });

  if (!created) {
    return { success: false, error: "Could not save tag. Apply migration 012 if tables are missing." };
  }

  revalidatePath(`/admin/customers/${encodeURIComponent(customerKey)}`);
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function adminRemoveCustomerTagAction(
  formData: FormData
): Promise<AdminCrmActionResult> {
  await requireAdminUser();
  const tagId = String(formData.get("tagId") ?? "");
  const customerKey = String(formData.get("customerKey") ?? "");
  const tag = String(formData.get("tag") ?? "");

  if (tagId) {
    const ok = await removeCustomerTag(tagId);
    if (!ok) {
      return { success: false, error: "Could not remove tag." };
    }
  } else if (customerKey && tag) {
    const { listCustomerTags, removeCustomerTag: remove } = await import(
      "@/lib/admin/customer-crm-repository"
    );
    const tags = await listCustomerTags(customerKey);
    const match = tags.find((row) => row.tag === tag);
    if (!match) {
      return { success: false, error: "Tag not found." };
    }
    await remove(match.id);
  } else {
    return { success: false, error: "Missing tag." };
  }

  if (customerKey) {
    revalidatePath(`/admin/customers/${encodeURIComponent(customerKey)}`);
    revalidatePath("/admin/customers");
  }
  return { success: true };
}

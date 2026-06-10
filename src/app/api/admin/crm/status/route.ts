import { NextResponse } from "next/server";
import {
  updateContactInquiryStatus,
  updateCreatorApplicationStatus,
  updatePartnerInquiryStatus,
} from "@/lib/admin/crm-repository";
import { getAdminUser } from "@/lib/admin/admin-auth";
import type {
  ContactInquiryStatus,
  CreatorApplicationStatus,
  PartnerInquiryStatus,
} from "@/lib/admin/admin-types";

export async function PATCH(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: {
    recordType?: string;
    id?: string;
    status?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { recordType, id, status, notes } = body;
  if (!recordType || !id || !status) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let ok = false;

  if (recordType === "creator") {
    ok = await updateCreatorApplicationStatus({
      id,
      status: status as CreatorApplicationStatus,
      notes,
    });
  } else if (recordType === "partner") {
    ok = await updatePartnerInquiryStatus({
      id,
      status: status as PartnerInquiryStatus,
      notes,
    });
  } else if (recordType === "contact") {
    ok = await updateContactInquiryStatus({
      id,
      status: status as ContactInquiryStatus,
      notes,
    });
  } else {
    return NextResponse.json({ error: "Unknown record type" }, { status: 400 });
  }

  if (!ok) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

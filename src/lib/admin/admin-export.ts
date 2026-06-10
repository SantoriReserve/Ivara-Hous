import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin/admin-auth";
import { buildCsv } from "@/lib/admin/admin-csv";
import { parseIncludeTestData } from "@/lib/admin/admin-test-data";
import type { AdminQueryOptions } from "@/lib/admin/admin-types";

export function adminQueryOptionsFromRequest(request: Request): AdminQueryOptions {
  const { searchParams } = new URL(request.url);
  return {
    includeTestData: parseIncludeTestData(searchParams.get("includeTestData") ?? undefined),
  };
}

export async function requireAdminExportAccess(): Promise<NextResponse | null> {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function csvResponse(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const body = buildCsv(headers, rows);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

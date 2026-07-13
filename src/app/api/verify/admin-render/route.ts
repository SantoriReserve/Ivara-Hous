import { NextResponse } from "next/server";
import { getAdminCustomers, getAdminNotifications } from "@/lib/admin/admin-repository";
import { getAdminEmailDeliveries, getAdminAssessments, getAdminActivityMetrics } from "@/lib/admin/admin-repository";
import { formatCurrency, formatDate, formatDateTime, formatPercent } from "@/lib/admin/admin-format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isInvalidDate(value: unknown): boolean {
  if (value == null || value === "") return false;
  const ms = new Date(String(value)).getTime();
  return Number.isNaN(ms);
}

function tryFormat(label: string, fn: () => string) {
  try {
    fn();
    return null;
  } catch (error) {
    return {
      label,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code") ?? "";
  if (code !== (process.env.ADMIN_ACCESS_CODE ?? "4488")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [notifications, customers, emails, assessments, activity] = await Promise.all([
    getAdminNotifications({ includeTestData: true }),
    getAdminCustomers({ includeTestData: true }),
    getAdminEmailDeliveries({ includeTestData: true, limit: 500 }),
    getAdminAssessments({ includeTestData: true }),
    getAdminActivityMetrics({ includeTestData: true }),
  ]);

  const invalidDates: Array<{ source: string; field: string; value: unknown }> = [];

  for (const item of notifications) {
    if (isInvalidDate(item.occurredAt)) {
      invalidDates.push({ source: `notification:${item.id}`, field: "occurredAt", value: item.occurredAt });
    }
  }
  for (const row of customers) {
    for (const field of ["purchaseDate", "lastLogin", "lastActiveAt"] as const) {
      if (isInvalidDate(row[field])) {
        invalidDates.push({ source: `customer:${row.customerKey}`, field, value: row[field] });
      }
    }
  }
  for (const row of emails) {
    if (isInvalidDate(row.createdAt)) {
      invalidDates.push({ source: `email:${row.id}`, field: "createdAt", value: row.createdAt });
    }
  }
  for (const row of assessments) {
    if (isInvalidDate(row.submittedAt)) {
      invalidDates.push({ source: `assessment:${row.id}`, field: "submittedAt", value: row.submittedAt });
    }
  }
  for (const row of activity.recentlyCompleted) {
    if (isInvalidDate(row.completedAt)) {
      invalidDates.push({
        source: `activity:${row.customerKey}`,
        field: "completedAt",
        value: row.completedAt,
      });
    }
  }

  const renderFailures = [
    tryFormat("overview currency", () => formatCurrency(0)),
    tryFormat("overview percent", () => formatPercent(12.5, 1)),
    ...notifications.flatMap((item) => [
      tryFormat(`notification date ${item.id}`, () => formatDateTime(item.occurredAt)),
    ]),
    ...customers.slice(0, 50).flatMap((row) => [
      tryFormat(`customer purchaseDate ${row.customerKey}`, () => formatDate(row.purchaseDate)),
      tryFormat(`customer lastActive ${row.customerKey}`, () => formatDateTime(row.lastActiveAt)),
    ]),
  ].filter(Boolean);

  // Force-render simulation of overview notification section for every item
  let overviewRenderError: { message: string; stack?: string } | null = null;
  try {
    for (const item of notifications) {
      formatDateTime(item.occurredAt);
      String(item.title);
      String(item.detail);
    }
  } catch (error) {
    overviewRenderError = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  return NextResponse.json({
    counts: {
      notifications: notifications.length,
      customers: customers.length,
      emails: emails.length,
      assessments: assessments.length,
      recentlyCompleted: activity.recentlyCompleted.length,
    },
    invalidDates,
    renderFailures,
    overviewRenderError,
    sampleNotification: notifications[0] ?? null,
    sampleCustomer: customers[0]
      ? {
          customerKey: customers[0].customerKey,
          purchaseDate: customers[0].purchaseDate,
          lastActiveAt: customers[0].lastActiveAt,
          tags: customers[0].tags,
        }
      : null,
  });
}

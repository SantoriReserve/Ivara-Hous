import { NextResponse } from "next/server";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ensurePlanForPurchase, retryFailedPlan } from "@/lib/plan/plan-generator";
import { getActivePurchaseForUser } from "@/lib/purchase-repository";

export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasAccess = await userHasPaidDashboardAccess(user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const purchase = await getActivePurchaseForUser(user.id);
  if (!purchase) {
    return NextResponse.json({ error: "No active purchase" }, { status: 404 });
  }

  let retry = false;
  try {
    const body = (await request.json()) as { retry?: boolean };
    retry = Boolean(body.retry);
  } catch {
    retry = false;
  }

  const result = retry
    ? await retryFailedPlan(user.id, purchase)
    : await ensurePlanForPurchase(user.id, purchase);

  return NextResponse.json(result);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchase = await getActivePurchaseForUser(user.id);
  if (!purchase) {
    return NextResponse.json({ error: "No active purchase" }, { status: 404 });
  }

  const { getPlanByPurchaseId } = await import("@/lib/plan/plan-repository");
  const plan = await getPlanByPurchaseId(purchase.id);

  return NextResponse.json({
    plan: plan
      ? {
          id: plan.id,
          status: plan.status,
          completionPercentage: plan.completionPercentage,
          currentFocusDay: plan.currentFocusDay,
        }
      : null,
  });
}

import type { AdminDataScope } from "@/lib/admin/admin-test-data";
import {
  isAutomatedTestAssessment,
  isAutomatedTestEmail,
} from "@/lib/admin/admin-test-data";

type PurchaseRow = {
  id: string;
  user_id: string | null;
  customer_email: string;
};

type AssessmentRow = {
  id: string;
  email: string;
  full_name: string;
};

type PlanRow = {
  id: string;
  user_id: string;
  purchase_id: string;
};

export function filterPurchases<T extends PurchaseRow>(
  purchases: T[],
  scope: AdminDataScope
): T[] {
  if (scope.includeTestData) {
    return purchases;
  }
  return purchases.filter((row) => !isAutomatedTestEmail(row.customer_email));
}

export function filterAssessments<T extends AssessmentRow>(
  assessments: T[],
  scope: AdminDataScope
): T[] {
  if (scope.includeTestData) {
    return assessments;
  }
  return assessments.filter(
    (row) => !isAutomatedTestAssessment({ email: row.email, fullName: row.full_name })
  );
}

export function buildTestPurchaseIdSet(purchases: PurchaseRow[]): Set<string> {
  return new Set(
    purchases
      .filter((row) => isAutomatedTestEmail(row.customer_email))
      .map((row) => row.id)
  );
}

export function buildTestUserIdSet(
  purchases: PurchaseRow[],
  authEmailByUserId?: Map<string, string | null>
): Set<string> {
  const ids = new Set<string>();
  for (const purchase of purchases) {
    if (purchase.user_id && isAutomatedTestEmail(purchase.customer_email)) {
      ids.add(purchase.user_id);
    }
  }
  if (authEmailByUserId) {
    for (const [userId, email] of authEmailByUserId.entries()) {
      if (isAutomatedTestEmail(email)) {
        ids.add(userId);
      }
    }
  }
  return ids;
}

export function filterPlans<T extends PlanRow>(
  plans: T[],
  scope: AdminDataScope,
  testPurchaseIds: Set<string>,
  testUserIds: Set<string>
): T[] {
  if (scope.includeTestData) {
    return plans;
  }
  return plans.filter(
    (plan) => !testPurchaseIds.has(plan.purchase_id) && !testUserIds.has(plan.user_id)
  );
}

export function filterByUserId<T extends { user_id: string }>(
  rows: T[],
  scope: AdminDataScope,
  testUserIds: Set<string>
): T[] {
  if (scope.includeTestData) {
    return rows;
  }
  return rows.filter((row) => !testUserIds.has(row.user_id));
}

export function filterEmailRecipient<T extends { recipientEmail: string }>(
  rows: T[],
  scope: AdminDataScope
): T[] {
  if (scope.includeTestData) {
    return rows;
  }
  return rows.filter((row) => !isAutomatedTestEmail(row.recipientEmail));
}

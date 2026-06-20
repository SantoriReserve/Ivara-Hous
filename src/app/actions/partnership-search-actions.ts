"use server";

import { getCurrentUser } from "@/lib/auth/require-user";
import { userHasPaidDashboardAccess } from "@/lib/auth/require-paid-access";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { searchPartnershipOpportunitiesGlobal } from "@/lib/dashboard/partnership-global-search";
import type { LocationSearchInput } from "@/lib/dashboard/partnership-search";
import type { PartnershipOpportunity } from "@/lib/dashboard/partnership-opportunities";

type SearchResult =
  | { success: true; opportunities: PartnershipOpportunity[]; count: number }
  | { success: false; error: string };

export async function searchPartnershipsByLocation(
  input: LocationSearchInput
): Promise<SearchResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const hasAccess = await userHasPaidDashboardAccess(user.id);
    if (!hasAccess) return { success: false, error: "Forbidden" };

    const { creatorContext } = await getDashboardContext(user.id);
    if (!creatorContext) return { success: false, error: "Creator context unavailable" };

    const opportunities = await searchPartnershipOpportunitiesGlobal(creatorContext, input, {
      userId: user.id,
    });
    return { success: true, opportunities, count: opportunities.length };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
    };
  }
}

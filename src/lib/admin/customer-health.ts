export type CustomerHealth = "on_track" | "needs_attention" | "at_risk";

export type CustomerLifecycleStatus = "active" | "completed" | "inactive" | "refunded";

export type CustomerAcquisitionSource = "free_assessment" | "direct_purchase" | "other";

export function daysSince(value: string | null | undefined, now = new Date()): number | null {
  if (!value) {
    return null;
  }
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) {
    return null;
  }
  return Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24));
}

export function resolveCustomerSource(hasAssessment: boolean): CustomerAcquisitionSource {
  return hasAssessment ? "free_assessment" : "direct_purchase";
}

export function resolveLifecycleStatus(params: {
  purchaseStatus: string | null | undefined;
  planStatus: string | null | undefined;
  lastActiveAt: string | null | undefined;
  now?: Date;
}): CustomerLifecycleStatus {
  if (params.purchaseStatus === "refunded") {
    return "refunded";
  }
  if (params.planStatus === "completed") {
    return "completed";
  }

  const inactiveDays = daysSince(params.lastActiveAt, params.now);
  if (
    params.planStatus === "active" &&
    (inactiveDays == null || inactiveDays >= 7)
  ) {
    return "inactive";
  }

  if (params.planStatus === "active") {
    return "active";
  }

  // generating / failed / missing plan — treat as inactive until engaged
  return "inactive";
}

/**
 * Simple health indicator for digital-product coaching:
 * - On Track: completed, or active with recent activity
 * - Needs Attention: 4–6 days quiet or early stall
 * - At Risk: 7+ days quiet (or never logged in after purchase)
 */
export function resolveCustomerHealth(params: {
  lifecycleStatus: CustomerLifecycleStatus;
  lastActiveAt: string | null | undefined;
  progressPercent: number | null | undefined;
  purchaseDate: string | null | undefined;
  now?: Date;
}): CustomerHealth {
  if (params.lifecycleStatus === "completed") {
    return "on_track";
  }
  if (params.lifecycleStatus === "refunded") {
    return "at_risk";
  }

  const inactiveDays = daysSince(params.lastActiveAt ?? params.purchaseDate, params.now);
  if (inactiveDays == null || inactiveDays >= 7) {
    return "at_risk";
  }
  if (inactiveDays >= 4) {
    return "needs_attention";
  }

  const progress = params.progressPercent ?? 0;
  if (progress < 5 && inactiveDays >= 2) {
    return "needs_attention";
  }

  return "on_track";
}

export function healthLabel(health: CustomerHealth): string {
  if (health === "on_track") return "On Track";
  if (health === "needs_attention") return "Needs Attention";
  return "At Risk";
}

export function lifecycleLabel(status: CustomerLifecycleStatus): string {
  if (status === "active") return "Active";
  if (status === "completed") return "Completed";
  if (status === "refunded") return "Refunded";
  return "Inactive";
}

export function sourceLabel(source: CustomerAcquisitionSource): string {
  if (source === "free_assessment") return "Free Assessment";
  if (source === "direct_purchase") return "Direct Purchase";
  return "Other";
}

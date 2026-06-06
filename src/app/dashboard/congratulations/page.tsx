import { redirect } from "next/navigation";
import { CongratulationsView } from "@/components/dashboard/CongratulationsView";
import {
  getProfileByUserId,
  markCongratulationsSeen,
} from "@/lib/auth/profile-repository";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";
import { getActivePlanForUser } from "@/lib/plan/plan-repository";

export default async function CongratulationsPage() {
  const user = await getCurrentUser();
  const plan = user ? await getActivePlanForUser(user.id) : null;
  const profile = user ? await getProfileByUserId(user.id) : null;

  if (!plan || plan.completionPercentage < 100) {
    redirect(ROUTES.dashboard);
  }

  if (user && !profile?.congratulationsSeenAt) {
    await markCongratulationsSeen(user.id);
  }

  const creatorName = profile?.fullName?.trim() || plan.planSummary.title.split("'")[0] || "Creator";

  return (
    <CongratulationsView
      creatorName={creatorName}
      completedTasks={plan.completedRequiredTasks}
      totalTasks={plan.totalRequiredTasks}
    />
  );
}

import { PartnershipDiscovery } from "@/components/dashboard/PartnershipDiscovery";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { getPartnershipOpportunities } from "@/lib/dashboard/partnership-opportunities";

export default async function PartnershipsPage() {
  const user = await getCurrentUser();
  const { creatorContext } = user ? await getDashboardContext(user.id) : { creatorContext: null };

  if (!creatorContext) {
    return (
      <div className="space-y-6">
        <p className="luxury-label text-gray-muted">Partnership Opportunities</p>
        <h2 className="font-serif text-3xl text-black">Curated Partnership Targets</h2>
        <p className="font-sans text-sm text-gray-mid">
          Your assessment results power personalized partnership recommendations.
        </p>
      </div>
    );
  }

  const opportunities = getPartnershipOpportunities(creatorContext);

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Partnership Opportunities</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Your Partnership Pipeline
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          Every card includes a specific action for today — who to contact, what to say, and
          which pitch to use. Your goal: {creatorContext.primaryGoal}.
        </p>
      </section>
      <PartnershipDiscovery
        creatorContext={creatorContext}
        curatedOpportunities={opportunities}
      />
    </div>
  );
}

import { ResourcesView } from "@/components/dashboard/ResourcesView";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { getDashboardResources } from "@/lib/dashboard/resources";

export default async function ResourcesPage() {
  const user = await getCurrentUser();
  const { creatorContext } = user ? await getDashboardContext(user.id) : { creatorContext: null };
  const resources = creatorContext ? getDashboardResources(creatorContext) : [];

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Resources</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Systems That Get You Booked
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          {creatorContext
            ? `Everything you need to move from "${creatorContext.biggestChallenge}" to your first ${creatorContext.dreamPartnerships} collaboration — with clear actions for today.`
            : "Premium tools for media kits, outreach tracking, rate cards, and portfolio development."}
        </p>
      </section>
      {resources.length > 0 ? (
        <ResourcesView resources={resources} />
      ) : (
        <p className="font-sans text-sm text-gray-mid">Complete your assessment to unlock personalized resources.</p>
      )}
    </div>
  );
}

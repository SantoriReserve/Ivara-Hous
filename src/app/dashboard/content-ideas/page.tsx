import { ContentIdeasView } from "@/components/dashboard/ContentIdeasView";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { getContentProgressForUser } from "@/lib/dashboard/dashboard-engagement-repository";
import { getContentIdeas } from "@/lib/dashboard/content-ideas";

export default async function ContentIdeasPage() {
  const user = await getCurrentUser();
  const { creatorContext } = user ? await getDashboardContext(user.id) : { creatorContext: null };

  if (!creatorContext) {
    return (
      <div className="space-y-6">
        <p className="luxury-label text-gray-muted">Content Ideas</p>
        <h2 className="font-serif text-3xl text-black">Ready-to-Execute Content</h2>
        <p className="font-sans text-sm text-gray-mid">
          Personalized content assignments appear after your assessment is complete.
        </p>
      </div>
    );
  }

  const ideas = getContentIdeas(creatorContext);
  const initialProgress = user ? await getContentProgressForUser(user.id) : [];

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Content Ideas</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Your Content Assignments
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          Step-by-step assignments — not prompts. Each idea includes what to shoot, how to post,
          and how to use it in your next pitch toward {creatorContext.dreamPartnerships}.
        </p>
      </section>
      <ContentIdeasView ideas={ideas} initialProgress={initialProgress} />
    </div>
  );
}

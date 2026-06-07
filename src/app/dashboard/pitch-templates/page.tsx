import { PitchTemplatesView } from "@/components/dashboard/PitchTemplatesView";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getDashboardContext } from "@/lib/dashboard/dashboard-context";
import { getPitchTemplates } from "@/lib/dashboard/pitch-templates";

export default async function PitchTemplatesPage() {
  const user = await getCurrentUser();
  const { creatorContext } = user ? await getDashboardContext(user.id) : { creatorContext: null };

  if (!creatorContext) {
    return (
      <div className="space-y-6">
        <p className="luxury-label text-gray-muted">Pitch Templates</p>
        <h2 className="font-serif text-3xl text-black">Partnership Pitch Library</h2>
        <p className="font-sans text-sm text-gray-mid">
          Complete your assessment and plan setup to unlock personalized pitch templates.
        </p>
      </div>
    );
  }

  const templates = getPitchTemplates(creatorContext);

  return (
    <div className="space-y-8">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Pitch Templates</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Copy-and-Paste Partnership Pitches
        </h2>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          Pre-filled for {creatorContext.fullName} ({creatorContext.instagram || "your handle"}).
          Each template includes a &ldquo;Send today&rdquo; action — personalize one detail
          about the property, then send.
        </p>
      </section>
      <PitchTemplatesView templates={templates} />
    </div>
  );
}

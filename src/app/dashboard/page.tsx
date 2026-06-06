import { getProfileByUserId } from "@/lib/auth/profile-repository";
import { getCurrentUser } from "@/lib/auth/require-user";
import { getActivePurchaseForUser } from "@/lib/purchase-repository";
import { CREATOR_DEVELOPMENT_PLAN_PRODUCT } from "@/lib/stripe-product";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const profile = user ? await getProfileByUserId(user.id) : null;
  const purchase = user ? await getActivePurchaseForUser(user.id) : null;

  return (
    <div className="space-y-10">
      <section>
        <p className="luxury-label mb-3 text-gray-muted">Overview</p>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-black">
          Your Creator Development Dashboard
        </h2>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-gray-mid">
          Your purchase is confirmed and your account is active. Your personalized
          40-day plan, daily tasks, and progress tracking will appear here in a
          future release.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="border border-black/10 p-6">
          <p className="luxury-label mb-2 text-gray-muted">Account</p>
          <p className="font-sans text-sm text-black">{profile?.email ?? user?.email}</p>
          {profile?.fullName && (
            <p className="mt-2 font-sans text-sm text-gray-mid">{profile.fullName}</p>
          )}
        </div>

        <div className="border border-black/10 p-6">
          <p className="luxury-label mb-2 text-gray-muted">Purchase</p>
          <p className="font-sans text-sm text-black">
            {CREATOR_DEVELOPMENT_PLAN_PRODUCT.name}
          </p>
          {purchase && (
            <p className="mt-2 font-sans text-xs text-gray-mid">
              Confirmed {new Date(purchase.purchasedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      <section className="border border-black/10 bg-black/5 p-6">
        <p className="luxury-label mb-2 text-gray-muted">Coming Next</p>
        <ul className="space-y-2 font-sans text-sm text-gray-mid">
          <li>Personalized 40-day plan generated from your assessment</li>
          <li>Daily action steps and progress tracking</li>
          <li>Plan delivery by email</li>
        </ul>
      </section>
    </div>
  );
}

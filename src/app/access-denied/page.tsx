import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

export default async function AccessDeniedPage() {
  const user = await getCurrentUser();

  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Dashboard Access Required"
        description={
          user
            ? "Your account is signed in, but we could not find an active purchase linked to this email. Purchase the 40-Day Creator Development Plan to unlock dashboard access."
            : "Sign in with the email you used at checkout, or purchase the plan to unlock dashboard access."
        }
      />
      <section className="py-section text-center sm:py-section-lg">
        <div className="luxury-container flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!user && (
            <Button href={ROUTES.login} variant="primary" size="lg">
              Sign In
            </Button>
          )}
          <Button href={ROUTES.creatorDevelopmentPlan} variant="secondary" size="lg">
            View The Plan
          </Button>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/require-user";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Access Denied",
  robots: { index: false, follow: false },
};

type AccessDeniedPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const user = await getCurrentUser();
  const { reason } = await searchParams;

  const reasonCopy: Record<string, string> = {
    email_mismatch:
      "The email on your account does not match your checkout email. Sign in with the same email used at purchase.",
    purchase_not_found:
      "We could not find your purchase yet. Wait a moment and try again, or contact support with your Stripe receipt.",
    purchase_already_claimed:
      "This purchase is already linked to another account. Sign in with the account you originally created.",
    claim_failed:
      "We could not link your purchase to this account. Sign in with your checkout email or contact support.",
  };

  const description = reason && reasonCopy[reason]
    ? reasonCopy[reason]
    : user
      ? "Your account is signed in, but we could not find an active purchase linked to this email. Purchase the 40-Day Creator Development Plan to unlock dashboard access."
      : "Sign in with the email and password you created after checkout, or purchase the plan to unlock dashboard access.";

  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Dashboard Access Required"
        description={description}
      />
      <section className="py-section text-center sm:py-section-md lg:py-section-xl">
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

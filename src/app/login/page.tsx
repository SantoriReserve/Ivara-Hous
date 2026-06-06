import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { PageHero } from "@/components/layout/PageHero";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Ivara Hous creator dashboard.",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : ROUTES.dashboard;

  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Sign In"
        description="Access your 40-Day Creator Development Plan dashboard with the email you used at checkout."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container">
          {error === "auth_callback_failed" && (
            <p className="mx-auto mb-8 max-w-md text-center font-sans text-sm text-red-600" role="alert">
              Sign-in could not be completed. Please request a new link.
            </p>
          )}
          <LoginForm nextPath={nextPath} />
          <p className="mx-auto mt-10 max-w-md text-center font-sans text-sm text-gray-mid">
            Just purchased?{" "}
            <Link href={ROUTES.claim} className="text-black underline underline-offset-4">
              Create your account
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

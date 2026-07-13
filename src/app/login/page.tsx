import type { Metadata } from "next";
import Link from "next/link";
import { PasswordAuthForm } from "@/components/auth/PasswordAuthForm";
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
    reset?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error, reset } = await searchParams;
  const nextPath = next?.startsWith("/") ? next : ROUTES.dashboard;

  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Sign In"
        description="Sign in with the email from your purchase. If you have not set a password yet, use Forgot Password to receive an access link."
      />
      <section className="py-section sm:py-section-md lg:py-section-xl">
        <div className="luxury-container">
          {reset === "success" && (
            <p
              className="mx-auto mb-8 max-w-md border border-black/10 bg-white px-5 py-4 text-center font-sans text-sm text-black"
              role="status"
            >
              Your password has been updated. Sign in with your new password below.
            </p>
          )}
          {error === "auth_callback_failed" && (
            <p className="mx-auto mb-8 max-w-md text-center font-sans text-sm text-red-600" role="alert">
              Sign-in could not be completed. Use your email and password below, or request a new
              password reset link.
            </p>
          )}
          <PasswordAuthForm mode="login" nextPath={nextPath} />
          <p className="mx-auto mt-10 max-w-md text-center font-sans text-sm text-gray-mid">
            Just purchased or missing your access email?{" "}
            <Link
              href={ROUTES.loginForgotPassword}
              className="text-black underline underline-offset-4"
            >
              Resend password setup email
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}

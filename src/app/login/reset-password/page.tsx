import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Create a new password for your Ivara Hous creator dashboard.",
};

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHero
        label="Creator Dashboard"
        title="Reset Password"
        description="Set a new password to restore access to your dashboard."
      />
      <section className="py-section sm:py-section-lg">
        <div className="luxury-container">
          {user ? (
            <ResetPasswordForm />
          ) : (
            <div className="mx-auto max-w-md text-center">
              <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
                Reset Link Expired
              </h1>
              <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">
                This password reset link is invalid or has expired. Request a new email to
                continue.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button href={ROUTES.loginForgotPassword} variant="primary" size="lg">
                  Request New Link
                </Button>
                <Link
                  href={ROUTES.login}
                  className="font-sans text-sm text-gray-mid underline-offset-4 hover:text-black hover:underline"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updatePasswordAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { ROUTES } from "@/lib/constants";

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updatePasswordAction(formData);

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
          Create New Password
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">
          Choose a new password for your creator dashboard. You&apos;ll sign in with it on the
          next screen.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="New Password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="luxury-input"
        />

        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          className="luxury-input"
        />

        {error && (
          <div className="space-y-3" role="alert">
            <p className="font-sans text-sm text-red-600">{error}</p>
            {/expired|reset link/i.test(error) && (
              <p className="font-sans text-sm text-gray-mid">
                <Link
                  href={ROUTES.loginForgotPassword}
                  className="text-black underline underline-offset-4"
                >
                  Request a new reset link
                </Link>
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full whitespace-nowrap"
          disabled={isPending}
        >
          {isPending ? "Saving…" : "Save New Password"}
        </Button>
      </form>
    </div>
  );
}

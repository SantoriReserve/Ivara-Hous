"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordResetAction } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { ROUTES } from "@/lib/constants";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    setSubmittedEmail(email);

    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);

      if (!result.success) {
        setError(result.error);
        setSent(false);
        return;
      }

      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
          Check Your Email
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">
          If an account or completed purchase exists for{" "}
          <span className="text-black">{submittedEmail}</span>, we sent a secure link to set your
          password. The link expires shortly for your security.
        </p>
        <p className="mt-6 font-sans text-sm text-gray-mid">
          Didn&apos;t receive it? Check spam, or{" "}
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError(null);
            }}
            className="text-black underline underline-offset-4"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-10">
          <Button href={ROUTES.login} variant="secondary" size="lg">
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
          Reset Password
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">
          Enter the email from your purchase. We&apos;ll send a secure link to set or reset your
          password — including if you paid but never finished account setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="luxury-input"
        />

        {error && (
          <p className="font-sans text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full whitespace-nowrap"
          disabled={isPending}
        >
          {isPending ? "Sending…" : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-10 text-center font-sans text-sm text-gray-mid">
        Remember your password?{" "}
        <Link href={ROUTES.login} className="text-black underline underline-offset-4">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

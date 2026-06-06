"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/stripe";

type LoginFormProps = {
  nextPath?: string;
  sessionId?: string;
  defaultEmail?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

export function LoginForm({
  nextPath = "/dashboard",
  sessionId,
  defaultEmail = "",
  title = "Sign In",
  description = "Enter the email you used at checkout. We will send you a secure sign-in link.",
  submitLabel = "Send Sign-In Link",
}: LoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const siteUrl = getSiteUrl().replace(/\/$/, "");
      const callbackParams = new URLSearchParams({ next: nextPath });

      if (sessionId) {
        callbackParams.set("session_id", sessionId);
      }

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?${callbackParams.toString()}`,
        },
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      setSent(true);
    } catch {
      setError("Could not send sign-in link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
          Check Your Email
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">
          We sent a secure sign-in link to <strong className="text-black">{email}</strong>.
          Open it on this device to continue.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">{title}</h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="email"
          disabled={Boolean(defaultEmail)}
        />

        {error && (
          <p className="font-sans text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending…" : submitLabel}
        </Button>
      </form>
    </div>
  );
}

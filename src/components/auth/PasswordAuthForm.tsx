"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  registerAndClaimAction,
  signInAction,
  type AuthActionResult,
} from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/forms/FormField";
import { ROUTES } from "@/lib/constants";

type PasswordAuthFormProps = {
  mode: "register" | "login";
  nextPath?: string;
  sessionId?: string;
  defaultEmail?: string;
  defaultFullName?: string;
  title?: string;
  description?: string;
  submitLabel?: string;
};

export function PasswordAuthForm({
  mode,
  nextPath = "/dashboard",
  sessionId,
  defaultEmail = "",
  defaultFullName = "",
  title,
  description,
  submitLabel,
}: PasswordAuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const heading =
    title ?? (mode === "register" ? "Create Your Account" : "Sign In");
  const copy =
    description ??
    (mode === "register"
      ? "Set your password to access your creator dashboard immediately."
      : "Enter your email and password to access your dashboard.");
  const buttonLabel =
    submitLabel ?? (mode === "register" ? "Create Account" : "Sign In");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      let result: AuthActionResult;

      if (mode === "register") {
        if (sessionId) {
          formData.set("sessionId", sessionId);
        }
        if (defaultEmail) {
          formData.set("email", defaultEmail);
        }
        result = await registerAndClaimAction(formData);
      } else {
        formData.set("nextPath", nextPath);
        result = await signInAction(formData);
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-3xl font-normal tracking-tight text-black">
          {heading}
        </h1>
        <p className="mt-4 font-sans text-sm leading-relaxed text-gray-mid">{copy}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === "register" && sessionId && (
          <input type="hidden" name="sessionId" value={sessionId} />
        )}

        {mode === "register" && (
          <FormField
            label="Full Name"
            name="fullName"
            type="text"
            defaultValue={defaultFullName}
            autoComplete="name"
          />
        )}

        <FormField
          label="Email"
          name="email"
          type="email"
          defaultValue={defaultEmail}
          required
          autoComplete="email"
          readOnly={Boolean(defaultEmail)}
          className={
            defaultEmail
              ? "luxury-input cursor-default bg-gray-light"
              : "luxury-input"
          }
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          required
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          minLength={8}
          className="luxury-input"
        />

        {mode === "login" && (
          <div className="-mt-2 flex justify-end">
            <Link
              href={ROUTES.loginForgotPassword}
              className="font-sans text-xs text-gray-mid transition-colors duration-luxury ease-luxury hover:text-black hover:underline hover:underline-offset-4"
            >
              Forgot Password?
            </Link>
          </div>
        )}

        {mode === "register" && (
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            minLength={8}
            className="luxury-input"
          />
        )}

        {error && (
          <div className="space-y-3" role="alert">
            <p className="font-sans text-sm text-red-600">{error}</p>
            {mode === "register" &&
              /already exists|sign in/i.test(error) && (
                <p className="font-sans text-sm text-gray-mid">
                  <Link
                    href={ROUTES.login}
                    className="text-black underline underline-offset-4"
                  >
                    Sign in to your existing account
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
          {isPending ? "Please wait…" : buttonLabel}
        </Button>
      </form>
    </div>
  );
}

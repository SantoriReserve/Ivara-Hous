"use client";

import { useState, useTransition } from "react";
import {
  adminResendPasswordSetupAction,
  adminResendWelcomeEmailAction,
} from "@/app/actions/admin-customer-actions";

export function AdminCustomerQuickActions({
  customerKey,
  email,
  assessmentId,
}: {
  customerKey: string;
  email: string;
  assessmentId: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: "welcome" | "password") {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result =
        action === "welcome"
          ? await adminResendWelcomeEmailAction(customerKey)
          : await adminResendPasswordSetupAction(customerKey);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(result.message);
    });
  }

  return (
    <div className="space-y-4 border border-black/10 p-6">
      <h3 className="font-serif text-2xl text-black">Quick Actions</h3>
      <div className="flex flex-wrap gap-2">
        {assessmentId ? (
          <a
            href={`/admin/assessments/${assessmentId}`}
            className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black"
          >
            View Assessment
          </a>
        ) : null}
        <a
          href="#activity-timeline"
          className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black"
        >
          View Activity
        </a>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(email);
            setMessage("Email copied.");
            setError(null);
          }}
          className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black"
        >
          Copy Email
        </button>
        <a
          href={`/admin/customers/${encodeURIComponent(customerKey)}/preview`}
          className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black"
        >
          Open Dashboard as Customer
        </a>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run("welcome")}
          className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black disabled:opacity-50"
        >
          Resend Welcome Email
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => run("password")}
          className="border border-black/20 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:border-black hover:text-black disabled:opacity-50"
        >
          Resend Password Setup
        </button>
        <span className="border border-dashed border-black/15 px-3 py-2 font-sans text-xs uppercase tracking-nav text-gray-muted">
          Download Report (Soon)
        </span>
      </div>
      {message ? <p className="font-sans text-sm text-black">{message}</p> : null}
      {error ? (
        <p className="font-sans text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

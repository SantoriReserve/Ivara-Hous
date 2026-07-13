"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ROUTES } from "@/lib/constants";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] page error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-center">
      <p className="luxury-label text-gray-muted">Admin</p>
      <h1 className="font-serif text-3xl text-black">Something went wrong</h1>
      <p className="font-sans text-sm text-gray-mid">
        This page hit a server error. Try again, or go back to the admin overview.
      </p>
      <div className="border border-black/10 bg-black/[0.02] p-4 text-left">
        <p className="font-sans text-xs uppercase tracking-nav text-gray-muted">Exception</p>
        <p className="mt-2 break-words font-mono text-sm text-black">
          {error.name}: {error.message || "(no message)"}
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-gray-muted">Digest: {error.digest}</p>
        ) : null}
        {error.stack ? (
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-[11px] text-gray-mid">
            {error.stack}
          </pre>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-black bg-black px-4 py-2 font-sans text-xs uppercase tracking-nav text-white"
        >
          Try again
        </button>
        <Link
          href={ROUTES.admin}
          className="border border-black/20 px-4 py-2 font-sans text-xs uppercase tracking-nav text-gray-mid hover:border-black hover:text-black"
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}

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
    <div className="mx-auto max-w-xl space-y-6 px-6 py-16 text-center">
      <p className="luxury-label text-gray-muted">Admin</p>
      <h1 className="font-serif text-3xl text-black">Something went wrong</h1>
      <p className="font-sans text-sm text-gray-mid">
        This page hit a server error. Try again, or go back to the admin overview.
      </p>
      {error.digest ? (
        <p className="font-sans text-xs text-gray-muted">Digest: {error.digest}</p>
      ) : null}
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

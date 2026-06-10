"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/lib/constants";

export function AdminPinForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? ROUTES.admin;
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        setError("Invalid access code. Please try again.");
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="luxury-label mb-2 block text-gray-muted" htmlFor="admin-pin">
          Owner Access Code
        </label>
        <input
          id="admin-pin"
          type="password"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter access code"
          className="luxury-input w-full text-center font-serif text-2xl tracking-[0.35em]"
        />
      </div>

      {error ? <p className="font-sans text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isLoading || !code.trim()}
        className="w-full border border-black bg-black px-6 py-3 font-sans text-xs uppercase tracking-nav text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
      >
        {isLoading ? "Verifying…" : "Enter Admin"}
      </button>
    </form>
  );
}

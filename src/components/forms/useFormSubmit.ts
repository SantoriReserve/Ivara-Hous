"use client";

import { useState } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

export function useFormSubmit(endpoint: string) {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(data: Record<string, unknown>) {
    setState("loading");
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Something went wrong. Please try again.");
      }

      setState("success");
      return json;
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Submission failed.");
      return null;
    }
  }

  function reset() {
    setState("idle");
    setError(null);
  }

  return { state, error, submit, reset, isLoading: state === "loading" };
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminStatusSelectProps = {
  recordType: "creator" | "partner" | "contact";
  recordId: string;
  value: string;
  options: Array<{ value: string; label: string }>;
};

export function AdminStatusSelect({
  recordType,
  recordId,
  value,
  options,
}: AdminStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(nextStatus: string) {
    setStatus(nextStatus);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/crm/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordType,
          id: recordId,
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        setStatus(value);
        setError("Could not update status.");
        return;
      }

      router.refresh();
    } catch {
      setStatus(value);
      setError("Could not update status.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        value={status}
        disabled={isLoading}
        onChange={(event) => handleChange(event.target.value)}
        className="luxury-input min-w-[9rem] py-2 font-sans text-xs uppercase tracking-nav"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <p className="font-sans text-[11px] text-red-600">{error}</p> : null}
    </div>
  );
}

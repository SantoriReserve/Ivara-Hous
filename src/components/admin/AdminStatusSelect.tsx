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

  async function handleChange(nextStatus: string) {
    setStatus(nextStatus);
    setIsLoading(true);

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
        return;
      }

      router.refresh();
    } catch {
      setStatus(value);
    } finally {
      setIsLoading(false);
    }
  }

  return (
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
  );
}

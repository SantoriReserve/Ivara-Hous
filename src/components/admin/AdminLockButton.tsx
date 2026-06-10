"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ROUTES } from "@/lib/constants";

export function AdminLockButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLock() {
    setIsLoading(true);

    try {
      await fetch("/api/admin/pin", { method: "DELETE" });
      router.push(ROUTES.adminGate);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLock}
      disabled={isLoading}
      className="font-sans text-xs uppercase tracking-nav text-white/65 transition-colors hover:text-white disabled:opacity-50"
    >
      {isLoading ? "Locking…" : "Lock Admin"}
    </button>
  );
}

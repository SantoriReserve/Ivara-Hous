"use client";

import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/Button";

type CheckoutButtonProps = {
  assessmentId?: string;
  customerEmail?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: ReactNode;
};

export function CheckoutButton({
  assessmentId,
  customerEmail,
  variant = "secondary",
  size = "lg",
  className = "",
  children = "Unlock Your 40-Day Creator Development Plan",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId, customerEmail }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.success || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        disabled={isLoading}
        onClick={handleCheckout}
      >
        {isLoading ? "Redirecting to checkout…" : children}
      </Button>
      {error && (
        <p className="mt-4 font-sans text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

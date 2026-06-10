import Link from "next/link";
import { Suspense } from "react";
import { AdminLockButton } from "@/components/admin/AdminLockButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminTestDataToggle } from "@/components/admin/AdminTestDataToggle";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import type { AdminAccessMode } from "@/lib/admin/admin-auth";
import { ROUTES, SITE_NAME } from "@/lib/constants";

type AdminShellProps = {
  children: React.ReactNode;
  userEmail: string;
  accessMode?: AdminAccessMode;
};

export function AdminShell({ children, userEmail, accessMode = "auth" }: AdminShellProps) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-white lg:min-h-[calc(100vh-6rem)]">
      <div className="border-b border-black/10 bg-black text-white">
        <div className="luxury-container flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="luxury-label mb-2 text-white/50">Business Command Center</p>
            <h1 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              {SITE_NAME} Admin
            </h1>
            <p className="mt-2 font-sans text-sm text-white/65">
              Executive overview for customers, revenue, plans, and communications
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Suspense fallback={null}>
              <AdminTestDataToggle />
            </Suspense>
            <span className="font-sans text-xs text-white/50">{userEmail}</span>
            <Link
              href={ROUTES.dashboard}
              className="font-sans text-xs uppercase tracking-nav text-white/65 transition-colors hover:text-white"
            >
              Creator Dashboard
            </Link>
            <Link
              href={ROUTES.home}
              className="font-sans text-xs uppercase tracking-nav text-white/65 transition-colors hover:text-white"
            >
              Website
            </Link>
            {accessMode === "pin" ? <AdminLockButton /> : <SignOutButton />}
          </div>
        </div>
      </div>

      <div className="luxury-container grid gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-[15rem_1fr] lg:py-14">
        <Suspense fallback={<div className="hidden lg:block lg:w-60" />}>
          <AdminNav />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { DashboardMobileNav } from "@/components/dashboard/DashboardMobileNav";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { ROUTES } from "@/lib/constants";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
};

export function DashboardShell({ children, userEmail, userName }: DashboardShellProps) {
  const displayName = userName?.trim() || userEmail;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] overflow-x-hidden bg-[#fafafa] lg:min-h-[calc(100vh-6rem)]">
      <div className="border-b border-black/10 bg-black text-white">
        <div className="luxury-container flex flex-col gap-6 py-6 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="luxury-label mb-2 text-white/50">Creator Operating System</p>
            <h1 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 font-sans text-sm text-white/65">
              Your personalized 40-day partnership development system
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ROUTES.home}
              className="font-sans text-xs uppercase tracking-nav text-white/65 transition-colors hover:text-white"
            >
              Website
            </Link>
            <Link
              href={ROUTES.creatorDevelopmentPlan}
              className="font-sans text-xs uppercase tracking-nav text-white/65 transition-colors hover:text-white"
            >
              Plan Overview
            </Link>
            <SignOutButton />
          </div>
        </div>
      </div>

      <div className="luxury-container py-6 sm:py-8 lg:py-14">
        <DashboardMobileNav />
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[15rem_1fr]">
          <DashboardNav />
          <div className="min-w-0 w-full max-w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { ROUTES, SITE_NAME } from "@/lib/constants";

type DashboardShellProps = {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
};

const DASHBOARD_NAV = [
  { href: ROUTES.dashboard, label: "Overview" },
  { href: ROUTES.dashboardToday, label: "Today" },
  { href: ROUTES.dashboardPlan, label: "40-Day Plan" },
] as const;

export function DashboardShell({ children, userEmail, userName }: DashboardShellProps) {
  const displayName = userName?.trim() || userEmail;

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-white lg:min-h-[calc(100vh-6rem)]">
      <div className="border-b border-black/10 bg-black text-white">
        <div className="luxury-container flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="luxury-label mb-2 text-white/50">Creator Dashboard</p>
            <h1 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 font-sans text-sm text-white/65">
              Your 40-Day Creator Development Plan dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
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

      <div className="luxury-container grid gap-8 py-8 sm:gap-10 sm:py-10 lg:grid-cols-[14rem_1fr] lg:py-14">
        <aside className="border-b border-black/10 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
          <p className="luxury-label mb-3 hidden text-gray-muted lg:mb-4 lg:block">{SITE_NAME}</p>
          <nav aria-label="Dashboard navigation">
            <ul className="flex gap-4 overflow-x-auto pb-1 lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0">
              {DASHBOARD_NAV.map((item) => (
                <li key={item.href} className="shrink-0">
                  <Link
                    href={item.href}
                    className="block whitespace-nowrap font-sans text-xs uppercase tracking-nav text-black transition-opacity hover:opacity-60 sm:text-sm"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

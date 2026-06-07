"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES, SITE_NAME } from "@/lib/constants";

type NavItem = { href: string; label: string; fullLabel?: string };

const DASHBOARD_NAV: NavItem[] = [
  { href: ROUTES.dashboard, label: "Overview" },
  { href: ROUTES.dashboardToday, label: "Today" },
  { href: ROUTES.dashboardPlan, label: "40-Day Plan" },
  { href: ROUTES.dashboardPitchTemplates, label: "Pitch Templates" },
  { href: ROUTES.dashboardPartnerships, label: "Partnerships", fullLabel: "Partnership Opportunities" },
  { href: ROUTES.dashboardContentIdeas, label: "Content Ideas" },
  { href: ROUTES.dashboardResources, label: "Resources" },
  { href: ROUTES.dashboardWins, label: "Wins & Progress" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-black/10 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
      <p className="luxury-label mb-3 hidden text-gray-muted lg:mb-4 lg:block">{SITE_NAME}</p>
      <nav aria-label="Dashboard navigation">
        <ul className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={item.href}
                  title={item.fullLabel ?? item.label}
                  className={`block border-l-2 py-2 pl-3 font-sans text-xs uppercase tracking-nav transition-colors sm:text-sm lg:max-w-[11rem] lg:whitespace-normal lg:leading-snug lg:pl-4 ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-mid hover:border-black/20 hover:text-black"
                  }`}
                >
                  <span className="whitespace-nowrap lg:whitespace-normal">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

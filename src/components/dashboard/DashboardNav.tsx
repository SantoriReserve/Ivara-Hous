"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { ROUTES, SITE_NAME } from "@/lib/constants";

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden border-r border-black/10 pr-8 lg:block">
      <p className="luxury-label mb-4 text-gray-muted">{SITE_NAME}</p>
      <nav aria-label="Dashboard navigation">
        <ul className="flex flex-col gap-0.5">
          {DASHBOARD_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.fullLabel ?? item.label}
                  className={`block max-w-[11rem] border-l-2 py-2 pl-4 font-sans text-sm uppercase leading-snug tracking-nav transition-colors ${
                    isActive
                      ? "border-black text-black"
                      : "border-transparent text-gray-mid hover:border-black/20 hover:text-black"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

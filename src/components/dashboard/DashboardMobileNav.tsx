"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { ROUTES } from "@/lib/constants";

export function DashboardMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <div className="sticky top-0 z-40 -mx-6 border-b border-black/10 bg-white px-6 py-4 sm:-mx-10 sm:px-10">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between border border-black bg-black px-5 py-3.5 font-sans text-xs uppercase tracking-nav text-white transition-opacity hover:opacity-90"
          aria-expanded={open}
          aria-controls="dashboard-mobile-drawer"
        >
          <span>Dashboard Menu</span>
          <span className="text-white/70" aria-hidden>
            ☰
          </span>
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
          aria-label="Close dashboard menu"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        id="dashboard-mobile-drawer"
        className={`fixed inset-y-0 left-0 z-[60] flex w-[min(100%,20rem)] flex-col border-r border-black/10 bg-white shadow-2xl transition-transform duration-luxury ease-luxury ${
          open ? "translate-x-0" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-black/10 px-6 py-5">
          <p className="luxury-label">Navigation</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="font-sans text-xs uppercase tracking-nav text-gray-mid transition-colors hover:text-black"
          >
            Close
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Dashboard navigation">
          <ul className="space-y-1">
            {DASHBOARD_NAV.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== ROUTES.dashboard && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`block border-l-2 py-3 pl-4 font-sans text-sm uppercase tracking-nav transition-colors ${
                      isActive
                        ? "border-black text-black"
                        : "border-transparent text-gray-mid hover:border-black/20 hover:text-black"
                    }`}
                  >
                    {item.fullLabel ?? item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

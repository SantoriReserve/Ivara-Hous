"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { withTestDataQuery } from "@/lib/admin/admin-test-data";
import { ROUTES } from "@/lib/constants";

const ADMIN_NAV = [
  { href: ROUTES.admin, label: "Overview" },
  { href: ROUTES.adminCustomers, label: "Plan Customers" },
  { href: ROUTES.adminRevenue, label: "Revenue" },
  { href: ROUTES.adminConversion, label: "Conversion" },
  { href: ROUTES.adminAnalytics, label: "Analytics" },
  { href: ROUTES.adminEmails, label: "Email Center" },
  { href: ROUTES.adminAssessments, label: "Assessments" },
  { href: ROUTES.adminPlans, label: "Plan Analytics" },
  { href: ROUTES.adminActivity, label: "Activity" },
  { href: ROUTES.adminCreatorCrm, label: "Creator CRM" },
  { href: ROUTES.adminPartnerCrm, label: "Partner CRM" },
  { href: ROUTES.adminContactInquiries, label: "Contact Inquiries" },
] as const;

const FUTURE_MODULES = [
  "Affiliate Tracking",
  "Support Tickets",
  "Revenue Forecasting",
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const includeTestData = searchParams.get("includeTestData") === "true";

  return (
    <aside className="border-b border-black/10 pb-4 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
      <p className="luxury-label mb-3 hidden text-gray-muted lg:mb-4 lg:block">Command Center</p>
      <nav aria-label="Admin navigation">
        <ul className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:pb-0">
          {ADMIN_NAV.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== ROUTES.admin && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="shrink-0 lg:shrink">
                <Link
                  href={withTestDataQuery(item.href, includeTestData)}
                  className={`block border-l-2 py-2 pl-3 font-sans text-xs uppercase tracking-nav transition-colors sm:text-sm lg:pl-4 ${
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

      <div className="mt-8 hidden border-t border-black/10 pt-6 lg:block">
        <p className="luxury-label mb-3 text-gray-muted">Future Modules</p>
        <ul className="space-y-2">
          {FUTURE_MODULES.map((module) => (
            <li
              key={module}
              className="font-sans text-xs text-gray-muted"
            >
              {module} · Coming Soon
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

import { ROUTES } from "@/lib/constants";

export type DashboardNavItem = {
  href: string;
  label: string;
  fullLabel?: string;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: ROUTES.dashboard, label: "Overview" },
  { href: ROUTES.dashboardToday, label: "Today" },
  { href: ROUTES.dashboardPlan, label: "40-Day Plan" },
  { href: ROUTES.dashboardPitchTemplates, label: "Pitch Templates" },
  {
    href: ROUTES.dashboardPartnerships,
    label: "Partnerships",
    fullLabel: "Partnership Opportunities",
  },
  { href: ROUTES.dashboardContentIdeas, label: "Content Ideas" },
  { href: ROUTES.dashboardResources, label: "Resources" },
  { href: ROUTES.dashboardWins, label: "Wins & Progress" },
];

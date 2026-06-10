export const SITE_NAME = "Ivara Hous";
export const SITE_TAGLINE = "Luxury Travel Agency";

/** Single source of truth for internal routes */
export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  creatorDevelopment: "/creator-development",
  creatorDevelopmentPlan: "/creator-development/plan",
  creatorDevelopmentPlanSuccess: "/creator-development/plan/success",
  creatorDevelopmentPlanCancel: "/creator-development/plan/cancel",
  login: "/login",
  claim: "/claim",
  dashboard: "/dashboard",
  dashboardToday: "/dashboard/today",
  dashboardPlan: "/dashboard/plan",
  dashboardPitchTemplates: "/dashboard/pitch-templates",
  dashboardPartnerships: "/dashboard/partnerships",
  dashboardContentIdeas: "/dashboard/content-ideas",
  dashboardResources: "/dashboard/resources",
  dashboardWins: "/dashboard/wins",
  dashboardCongratulations: "/dashboard/congratulations",
  accessDenied: "/access-denied",
  admin: "/admin",
  adminGate: "/admin/gate",
  adminCustomers: "/admin/customers",
  adminRevenue: "/admin/revenue",
  adminEmails: "/admin/emails",
  adminAssessments: "/admin/assessments",
  adminPlans: "/admin/plans",
  adminActivity: "/admin/activity",
  adminCreatorCrm: "/admin/creator-crm",
  adminPartnerCrm: "/admin/partner-crm",
  adminContactInquiries: "/admin/contact-inquiries",
  adminAccessDenied: "/admin/access-denied",
  creatorApplication: "/creator-application",
  partnerWithUs: "/partner-with-us",
  creativePartnerApplication: "/creative-partner-application",
  contact: "/contact",
} as const;

/** Main navigation — application pages use header buttons */
export const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.services, label: "Services" },
  { href: ROUTES.creatorDevelopment, label: "Creator Development" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

export const FOOTER_LINKS = {
  explore: [
    { href: ROUTES.about, label: "About" },
    { href: ROUTES.services, label: "Services" },
    { href: ROUTES.contact, label: "Contact" },
  ],
  creators: [
    { href: ROUTES.creatorApplication, label: "Travel Creator Roster" },
    { href: ROUTES.creatorDevelopment, label: "Creator Development" },
  ],
  partners: [
    { href: ROUTES.partnerWithUs, label: "Partner With Us" },
    { href: ROUTES.creativePartnerApplication, label: "Creative Partner Application" },
  ],
} as const;

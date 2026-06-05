export const SITE_NAME = "Ivara Hous";
export const SITE_TAGLINE = "Luxury Travel Agency";

/** Single source of truth for internal routes */
export const ROUTES = {
  home: "/",
  about: "/about",
  services: "/services",
  creatorDevelopment: "/creator-development",
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
    { href: ROUTES.creatorApplication, label: "Creator Application" },
    { href: ROUTES.creatorDevelopment, label: "Creator Development" },
  ],
  partners: [
    { href: ROUTES.partnerWithUs, label: "Partner With Us" },
    { href: ROUTES.creativePartnerApplication, label: "Creative Partner Application" },
  ],
} as const;

/**
 * Product catalog for multi-product admin scalability.
 * Add products here without redesigning admin surfaces.
 */
export const ADMIN_PRODUCTS = [
  {
    slug: "40-day-creator-development-plan",
    name: "40-Day Creator Development Plan",
    shortName: "CDS",
    kind: "program" as const,
  },
] as const;

export type AdminProductSlug = (typeof ADMIN_PRODUCTS)[number]["slug"];

export function getAdminProduct(slug: string | null | undefined) {
  return (
    ADMIN_PRODUCTS.find((product) => product.slug === slug) ?? {
      slug: slug || "unknown",
      name: slug || "Unknown Product",
      shortName: "Product",
      kind: "other" as const,
    }
  );
}

export const SUGGESTED_CUSTOMER_TAGS = [
  "VIP",
  "Potential Case Study",
  "Ambassador",
  "High Engagement",
  "Needs Follow Up",
  "Fashion Creator",
  "Beauty Creator",
  "Travel Creator",
  "Miami Creator",
  "Wants Coaching",
] as const;

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import type { AdminCustomerFilter } from "@/lib/admin/admin-types";
import { SUGGESTED_CUSTOMER_TAGS } from "@/lib/admin/admin-products";

const FILTERS: Array<{ value: AdminCustomerFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "inactive", label: "Inactive" },
  { value: "on_track", label: "On Track" },
  { value: "needs_attention", label: "Needs Attention" },
  { value: "at_risk", label: "At Risk" },
  { value: "free_assessment", label: "Free Assessment" },
  { value: "direct_purchase", label: "Direct Purchase" },
  { value: "high_engagement", label: "High Completion" },
  { value: "low_engagement", label: "Low Completion" },
];

export function AdminCustomerFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const currentFilter = (searchParams.get("filter") as AdminCustomerFilter) ?? "all";
  const currentTag = searchParams.get("tag") ?? "";

  function updateParams(next: { q?: string; filter?: string; tag?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.filter !== undefined) {
      if (next.filter && next.filter !== "all") params.set("filter", next.filter);
      else params.delete("filter");
    }
    if (next.tag !== undefined) {
      if (next.tag) params.set("tag", next.tag);
      else params.delete("tag");
    }
    const query = params.toString();
    router.push(query ? `${ROUTES.adminCustomers}?${query}` : ROUTES.adminCustomers);
  }

  return (
    <div className="space-y-4 border border-black/10 p-4">
      <div>
        <label className="luxury-label mb-2 block text-gray-muted" htmlFor="customer-search">
          Search
        </label>
        <input
          id="customer-search"
          type="search"
          defaultValue={currentQuery}
          placeholder="Name, email, or tag"
          className="luxury-input w-full"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateParams({ q: event.currentTarget.value });
            }
          }}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => updateParams({ filter: filter.value })}
            className={`border px-3 py-2 font-sans text-xs uppercase tracking-nav transition-colors ${
              currentFilter === filter.value
                ? "border-black bg-black text-white"
                : "border-black/20 text-gray-mid hover:border-black hover:text-black"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div>
        <p className="luxury-label mb-2 text-gray-muted">Tags</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ tag: "" })}
            className={`border px-3 py-2 font-sans text-xs uppercase tracking-nav ${
              !currentTag
                ? "border-black bg-black text-white"
                : "border-black/20 text-gray-mid hover:border-black hover:text-black"
            }`}
          >
            All Tags
          </button>
          {SUGGESTED_CUSTOMER_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => updateParams({ tag })}
              className={`border px-3 py-2 font-sans text-xs uppercase tracking-nav ${
                currentTag === tag
                  ? "border-black bg-black text-white"
                  : "border-black/20 text-gray-mid hover:border-black hover:text-black"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AdminTestDataToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const includeTestData = searchParams.get("includeTestData") === "true";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (includeTestData) {
      params.delete("includeTestData");
    } else {
      params.set("includeTestData", "true");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-3 border border-white/25 px-4 py-2 font-sans text-xs uppercase tracking-nav text-white/80">
      <input
        type="checkbox"
        checked={includeTestData}
        onChange={toggle}
        className="h-4 w-4 border-white/40"
      />
      Include Test Data
    </label>
  );
}

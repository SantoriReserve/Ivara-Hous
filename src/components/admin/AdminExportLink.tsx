import Link from "next/link";
import { withTestDataQuery } from "@/lib/admin/admin-test-data";

export function AdminExportLink({
  href,
  label,
  includeTestData = false,
}: {
  href: string;
  label: string;
  includeTestData?: boolean;
}) {
  const exportHref = withTestDataQuery(href, includeTestData);

  return (
    <Link
      href={exportHref}
      className="inline-flex items-center border border-black px-4 py-2 font-sans text-xs uppercase tracking-nav text-black transition-colors hover:bg-black hover:text-white"
    >
      {label}
    </Link>
  );
}

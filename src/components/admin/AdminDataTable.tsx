"use client";

import { useRouter } from "next/navigation";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

export function AdminDataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  rowHref?: (row: T) => string;
}) {
  const router = useRouter();

  if (!rows.length) {
    return (
      <div className="border border-black/10 p-8 text-center font-sans text-sm text-gray-mid">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-black/10">
      <table className="min-w-full divide-y divide-black/10">
        <thead className="bg-black/[0.02]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left font-sans text-xs uppercase tracking-nav text-gray-muted ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black/10 bg-white">
          {rows.map((row, index) => {
            const href = rowHref?.(row);
            return (
              <tr
                key={index}
                className={href ? "cursor-pointer hover:bg-black/[0.03]" : "hover:bg-black/[0.02]"}
                onClick={href ? () => router.push(href) : undefined}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 font-sans text-sm text-black ${column.className ?? ""}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

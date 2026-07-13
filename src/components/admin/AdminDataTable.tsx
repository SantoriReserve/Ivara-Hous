type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

/**
 * Server Component table.
 *
 * IMPORTANT: This must remain a Server Component. Admin list pages pass
 * `render` functions from RSC. Client Components cannot receive function
 * props from Server Components — that throws a Next.js serialization
 * error (digest crash) at render time.
 */
export function AdminDataTable<T>({
  columns,
  rows,
  emptyMessage = "No records found.",
}: {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  /** @deprecated Use a Link inside a column render. Kept optional for type-compat during migration. */
  rowHref?: (row: T) => string;
}) {
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
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-black/[0.02]">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-4 py-3 font-sans text-sm text-black ${column.className ?? ""}`}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

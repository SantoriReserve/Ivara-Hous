export function toCsvRow(values: Array<string | number | null | undefined>): string {
  return values
    .map((value) => {
      const text = value == null ? "" : String(value);
      if (text.includes(",") || text.includes('"') || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    })
    .join(",");
}

export function buildCsv(headers: string[], rows: Array<Array<string | number | null | undefined>>): string {
  return [toCsvRow(headers), ...rows.map((row) => toCsvRow(row))].join("\n");
}

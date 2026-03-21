/**
 * CSV Export Utility
 *
 * Pure client-side CSV generation and download using Blob + temporary anchor element.
 */

/**
 * Escapes a single CSV cell value according to RFC 4180:
 * - Wraps in double quotes if the value contains commas, quotes, or newlines
 * - Doubles any existing double-quote characters
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return escapeCsvCell(JSON.stringify(value));
  }

  const str = String(value);

  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Exports an array of objects to a CSV file and triggers a browser download.
 *
 * - Auto-generates column headers from the union of all object keys.
 * - Nested objects/arrays are serialized via JSON.stringify.
 * - Handles commas, quotes, and newlines within values.
 *
 * @param data     Array of flat or nested objects to export.
 * @param filename Desired filename for the download (should end in .csv).
 */
export function exportToCsv(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) {
    return;
  }

  // Collect the unique set of keys across all rows, preserving insertion order.
  const headersSet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      headersSet.add(key);
    }
  }
  const headers = Array.from(headersSet);

  // Build CSV string: header row + data rows.
  const headerLine = headers.map(escapeCsvCell).join(",");

  const lines = data.map((row) =>
    headers.map((header) => escapeCsvCell(row[header])).join(",")
  );

  const csvContent = [headerLine, ...lines].join("\r\n");

  // Use BOM so Excel correctly interprets UTF-8 characters.
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formats an ISO 8601 date string into a human-readable format (e.g. "Mar 16, 2026, 2:30 PM").
 * Returns an empty string for null/undefined/invalid input.
 *
 * @param date ISO date string or null.
 */
export function formatDate(date: string | null): string {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Minimal RFC4180-style CSV helpers. Deliberately dependency-free: the only
// shapes we handle are the ones the dashboard exports and the ones Shopee /
// TikTok Shop / BCL.my order exports actually produce.

/** Escapes one field: quote it when it contains a comma, quote or newline. */
function escapeField(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: (string | number)[][]): string {
  // \r\n and a UTF-8 BOM so Excel on Windows opens Malay text correctly.
  const lines = [headers.map(escapeField).join(","), ...rows.map((row) => row.map(escapeField).join(","))];
  return `﻿${lines.join("\r\n")}`;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const blob = new Blob([toCsv(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Parses CSV text into rows of fields, honouring quoted fields that contain
 * commas, escaped double-quotes ("") and newlines inside quotes.
 */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += char;
      continue;
    }

    if (char === '"') { inQuotes = true; continue; }
    if (char === ",") { row.push(field); field = ""; continue; }
    if (char === "\r") continue;
    if (char === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
    field += char;
  }

  // Trailing field/row when the file doesn't end with a newline.
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

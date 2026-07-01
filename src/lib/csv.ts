export function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = values[index]?.trim() ?? "";
    });

    return row;
  });
}

function escapeCsvValue(value: string | number | boolean | null | undefined): string {
  if (value == null) return "";
  const stringValue = String(value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildAssetsCsv(
  rows: Array<Record<string, string | number | boolean | null | undefined>>,
): string {
  if (rows.length === 0) {
    return `${ASSET_IMPORT_HEADERS.join(",")}\n`;
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

export const ASSET_IMPORT_HEADERS = [
  "name",
  "category",
  "status",
  "site",
  "location",
  "serial_number",
  "purchase_price",
  "purchase_date",
  "useful_life_date",
  "disposal_date",
  "book_value",
  "book_value_override",
  "depreciation_method",
  "description",
] as const;

export function buildAssetImportTemplate(): string {
  return buildAssetsCsv([
    {
      name: "Example Asset",
      category: "Furniture",
      status: "active",
      site: "Church at Stockbridge",
      location: "Sanctuary",
      serial_number: "ABC-123",
      purchase_price: 2500,
      purchase_date: "2026-01-15",
      useful_life_date: "",
      disposal_date: "",
      book_value: "",
      book_value_override: false,
      depreciation_method: "",
      description: "Optional notes",
    },
  ]);
}

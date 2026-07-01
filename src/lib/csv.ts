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
    return "name,category,status,site,location,serial_number,purchase_price,purchase_date,useful_life_date,disposal_date,book_value,book_value_override,depreciation_method,description,created_at\n";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

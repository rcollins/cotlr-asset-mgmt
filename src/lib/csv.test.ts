import { describe, expect, it } from "vitest";
import {
  ASSET_IMPORT_HEADERS,
  buildAssetImportTemplate,
  buildAssetsCsv,
  parseCsv,
  parseCsvLine,
} from "./csv";

describe("parseCsvLine", () => {
  it("splits simple comma-separated values", () => {
    expect(parseCsvLine("a,b,c")).toEqual(["a", "b", "c"]);
  });

  it("preserves commas inside quoted fields", () => {
    expect(parseCsvLine('a,"b,c",d')).toEqual(["a", "b,c", "d"]);
  });

  it("unescapes doubled quotes inside quoted fields", () => {
    expect(parseCsvLine('"He said ""hello"""')).toEqual(['He said "hello"']);
  });

  it("handles empty trailing fields", () => {
    expect(parseCsvLine("a,b,")).toEqual(["a", "b", ""]);
  });
});

describe("parseCsv", () => {
  it("maps rows to lowercase header keys", () => {
    const rows = parseCsv("Name,Category,Status\nDesk,Furniture,active");
    expect(rows).toEqual([
      { name: "Desk", category: "Furniture", status: "active" },
    ]);
  });

  it("returns an empty array when only a header row is present", () => {
    expect(parseCsv("name,category")).toEqual([]);
  });

  it("strips a UTF-8 BOM from the start of the file", () => {
    const rows = parseCsv("\uFEFFname,status\nChair,active");
    expect(rows).toEqual([{ name: "Chair", status: "active" }]);
  });

  it("supports Windows line endings", () => {
    const rows = parseCsv("name,status\r\nChair,active\r\nTable,inactive");
    expect(rows).toEqual([
      { name: "Chair", status: "active" },
      { name: "Table", status: "inactive" },
    ]);
  });

  it("skips blank lines", () => {
    const rows = parseCsv("name,status\n\nChair,active\n\n");
    expect(rows).toEqual([{ name: "Chair", status: "active" }]);
  });

  it("parses quoted fields with commas and escaped quotes", () => {
    const rows = parseCsv(
      'name,description\n"Asset A","Notes, with comma"\n"Asset B","He said ""hi"""',
    );
    expect(rows).toEqual([
      { name: "Asset A", description: "Notes, with comma" },
      { name: "Asset B", description: 'He said "hi"' },
    ]);
  });

  it("fills missing trailing columns with empty strings", () => {
    const rows = parseCsv("name,category,status\nDesk,Furniture");
    expect(rows).toEqual([{ name: "Desk", category: "Furniture", status: "" }]);
  });
});

describe("buildAssetsCsv", () => {
  it("quotes values that contain commas or quotes", () => {
    const csv = buildAssetsCsv([
      { name: "Desk", description: 'Notes, "special"' },
    ]);
    expect(csv).toBe('name,description\nDesk,"Notes, ""special"""\n');
  });

  it("uses import headers when there are no rows", () => {
    const csv = buildAssetsCsv([]);
    expect(csv).toBe(`${ASSET_IMPORT_HEADERS.join(",")}\n`);
  });
});

describe("buildAssetImportTemplate", () => {
  it("produces a parseable CSV with the expected headers", () => {
    const template = buildAssetImportTemplate();
    const rows = parseCsv(template);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Example Asset");
    expect(rows[0].status).toBe("active");
  });
});

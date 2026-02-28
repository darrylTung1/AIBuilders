import { z } from "zod";

/**
 * Expected row shape from restaurant SQL (INSERT or SELECT-style data).
 * We support: name, description, price, popularity (or sales_count), category
 */
const MenuRowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.union([z.number(), z.string()]).transform((v) => Number(v)),
  popularity: z.union([z.number(), z.string()]).optional().transform((v) => (v != null ? Number(v) : null)),
  sales_count: z.union([z.number(), z.string()]).optional().transform((v) => (v != null ? Number(v) : null)),
  category: z.string().optional().nullable(),
});

export type ParsedMenuItem = {
  name: string;
  description: string | null;
  price: number;
  popularityScore: number | null;
  category: string | null;
};

/**
 * Extract VALUES (...), (...) from INSERT statements.
 */
function extractValuesFromInsert(sql: string): string[][] {
  const rows: string[][] = [];
  const valuesMatch = sql.match(/VALUES\s*/i);
  if (!valuesMatch) return rows;
  const valuesStart = valuesMatch.index!;
  const afterValues = sql.slice(valuesStart + valuesMatch[0].length).trimStart();
  let depth = 0;
  let start = 0;
  for (let i = 0; i < afterValues.length; i++) {
    const c = afterValues[i];
    if (c === "(") {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (c === ")") {
      depth--;
      if (depth === 0) {
        const rowStr = afterValues.slice(start, i);
        const parts = parseValueList(rowStr);
        if (parts.length) rows.push(parts);
      }
    }
  }
  return rows;
}

function parseValueList(str: string): string[] {
  const parts: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  let justExitedQuote = false;
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (!inQuote) {
      if (c === "'" || c === '"') {
        inQuote = true;
        quoteChar = c;
        current = "";
        justExitedQuote = false;
      } else if (c === ",") {
        if (!justExitedQuote) {
          parts.push(current.trim());
        }
        current = "";
        justExitedQuote = false;
      } else {
        current += c;
        justExitedQuote = false;
      }
    } else {
      if (c === quoteChar && str[i - 1] !== "\\") {
        inQuote = false;
        parts.push(current);
        current = "";
        justExitedQuote = true;
      } else {
        current += c;
      }
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

/**
 * Try to infer column names from INSERT INTO table (col1, col2) VALUES ...
 */
function inferColumnsFromInsert(sql: string): string[] | null {
  const match = sql.match(/INSERT\s+INTO\s+\w+\s*\(([^)]+)\)/i);
  if (match) {
    return match[1].split(",").map((c) => c.trim().replace(/^"|"$/g, "").toLowerCase());
  }
  return null;
}

/**
 * Map common column names to our schema: name, description, price, popularity (or sales_count), category
 */
const COLUMN_ALIASES: Record<string, string> = {
  name: "name",
  item_name: "name",
  dish: "name",
  description: "description",
  desc: "description",
  price: "price",
  prices: "price",
  popularity: "popularity",
  popularity_score: "popularity",
  sales_count: "sales_count",
  sales: "sales_count",
  category: "category",
  category_name: "category",
};

function mapRowToObject(columns: string[], values: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  columns.forEach((col, i) => {
    const key = COLUMN_ALIASES[col] ?? col;
    let val: unknown = values[i];
    if (typeof val === "string") {
      val = val.replace(/^'|'$/g, "").replace(/^"|"$/g, "");
      const num = Number(val);
      if (val !== "" && !Number.isNaN(num)) val = num;
    }
    obj[key] = val;
  });
  return obj;
}

/**
 * Parse SQL file content into an array of menu items.
 * Supports: INSERT INTO table (name, description, price, ...) VALUES (...), (...);
 * Column names are case-insensitive and can use common aliases (item_name -> name, etc.)
 */
export function parseMenuSql(sql: string): ParsedMenuItem[] {
  const normalized = sql.trim();
  const columns = inferColumnsFromInsert(normalized);
  const rows = extractValuesFromInsert(normalized);

  if (!columns || columns.length === 0) {
    throw new Error("Could not infer column names from INSERT statement. Use: INSERT INTO menu (name, description, price, popularity, category) VALUES (...);");
  }

  const mappedColumns = columns.map((c) => COLUMN_ALIASES[c.toLowerCase()] ?? c.toLowerCase());
  const nameIdx = mappedColumns.indexOf("name");
  const priceIdx = mappedColumns.indexOf("price");
  if (nameIdx === -1 || priceIdx === -1) {
    throw new Error("SQL must include at least 'name' and 'price' columns.");
  }

  const results: ParsedMenuItem[] = [];
  for (const values of rows) {
    const obj = mapRowToObject(columns, values);
    const popularity = (obj.popularity as number | null) ?? (obj.sales_count as number | null) ?? null;
    const parsed = MenuRowSchema.safeParse({
      name: obj.name,
      description: obj.description ?? null,
      price: obj.price,
      popularity,
      sales_count: obj.sales_count ?? popularity,
      category: obj.category ?? null,
    });
    if (!parsed.success) continue;
    const p = parsed.data;
    results.push({
      name: p.name,
      description: p.description ?? null,
      price: p.price,
      popularityScore: p.popularity ?? p.sales_count ?? null,
      category: p.category ?? null,
    });
  }
  return results;
}

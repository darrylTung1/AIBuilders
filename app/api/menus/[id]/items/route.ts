import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("./dev.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    popularity_score TEXT,
    category TEXT,
    sort_order INTEGER DEFAULT 0,
    image_url TEXT,
    cost_estimate TEXT,
    is_recommended BOOLEAN DEFAULT FALSE,
    font_size_tier TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES menus (id)
  )
`);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  
  const stmt = db.prepare(`SELECT * FROM menu_items WHERE menu_id = ? ORDER BY sort_order ASC, id ASC`);
  const items = stmt.all(menuId);
  return NextResponse.json(items);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  
  const body = await request.json() as Record<string, unknown>;
  const name = body.name as string;
  const price = body.price != null ? String(body.price) : undefined;
  if (!name?.trim() || price == null) {
    return NextResponse.json({ error: "name and price are required" }, { status: 400 });
  }
  
  const stmt = db.prepare(`
    INSERT INTO menu_items (
      menu_id, name, description, price, popularity_score, category, 
      sort_order, image_url, is_recommended, font_size_tier, cost_estimate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const result = stmt.run(
    menuId,
    name.trim(),
    (body.description as string) ?? null,
    price,
    body.popularityScore != null ? String(body.popularityScore) : null,
    (body.category as string) ?? null,
    typeof body.sortOrder === "number" ? body.sortOrder : 0,
    (body.imageUrl as string) ?? null,
    Boolean(body.isRecommended) ? 1 : 0,
    (body.fontSizeTier as string) ?? "normal",
    body.costEstimate != null ? String(body.costEstimate) : null
  );
  
  const id = result.lastInsertRowid as number;
  const selectStmt = db.prepare(`SELECT * FROM menu_items WHERE id = ?`);
  const row = selectStmt.get(id);
  
  return NextResponse.json(row);
}

import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("./dev.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    pdf_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants (id)
  )
`);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");
  try {
    let list;
    if (restaurantId && !Number.isNaN(Number(restaurantId))) {
      const stmt = db.prepare(`SELECT * FROM menus WHERE restaurant_id = ? ORDER BY created_at DESC`);
      list = stmt.all(Number(restaurantId));
    } else {
      const stmt = db.prepare(`SELECT * FROM menus ORDER BY created_at DESC`);
      list = stmt.all();
    }
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list menus" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { restaurantId, name } = body as { restaurantId: number; name: string };
    if (!restaurantId || !name?.trim()) {
      return NextResponse.json({ error: "restaurantId and name are required" }, { status: 400 });
    }
    
    const stmt = db.prepare(`
      INSERT INTO menus (restaurant_id, name, version) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(restaurantId, name.trim(), 1);
    const id = result.lastInsertRowid as number;
    
    const selectStmt = db.prepare(`SELECT * FROM menus WHERE id = ?`);
    const row = selectStmt.get(id);
    
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}

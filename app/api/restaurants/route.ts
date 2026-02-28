import { NextResponse } from "next/server";
import Database from "better-sqlite3";

const db = new Database("./dev.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cuisine_type TEXT,
    theme TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export async function GET() {
  try {
    const stmt = db.prepare(`SELECT * FROM restaurants ORDER BY created_at DESC`);
    const list = stmt.all();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: message || "Failed to list restaurants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cuisineType, theme } = body as { name: string; cuisineType?: string; theme?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    
    const stmt = db.prepare(`
      INSERT INTO restaurants (name, cuisine_type, theme) 
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(name.trim(), cuisineType ?? null, theme ?? null);
    const id = result.lastInsertRowid as number;
    
    const selectStmt = db.prepare(`SELECT * FROM restaurants WHERE id = ?`);
    const row = selectStmt.get(id);
    
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "";
    return NextResponse.json(
      { error: message || "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

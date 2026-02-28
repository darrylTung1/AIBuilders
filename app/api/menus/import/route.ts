import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menus, menuItems, menuImports } from "@/lib/db/schema";
import { parseMenuSql } from "@/lib/import/parse-menu-sql";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let sql: string;
    let restaurantId: number;
    let menuName: string;

    if (contentType.includes("application/json")) {
      const body = await request.json() as { sql: string; restaurantId: number; menuName?: string };
      sql = body.sql;
      restaurantId = body.restaurantId;
      menuName = body.menuName ?? "Imported Menu";
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const restId = formData.get("restaurantId");
      const name = formData.get("menuName");
      if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
      restaurantId = Number(restId);
      menuName = (name as string) ?? "Imported Menu";
      sql = await file.text();
    } else {
      return NextResponse.json({ error: "Send JSON with sql, restaurantId, menuName or multipart with file, restaurantId, menuName" }, { status: 400 });
    }

    if (!sql?.trim()) return NextResponse.json({ error: "SQL content is required" }, { status: 400 });
    if (!restaurantId || Number.isNaN(restaurantId)) return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });

    const parsed = parseMenuSql(sql);
    if (parsed.length === 0) return NextResponse.json({ error: "No valid menu items found in SQL" }, { status: 400 });

    const [menu] = await db.insert(menus).values({ restaurantId, name: menuName }).returning();
    if (!menu) return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });

    const itemsToInsert = parsed.map((p, i) => ({
      menuId: menu.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      popularityScore: p.popularityScore != null ? String(p.popularityScore) : null,
      category: p.category,
      sortOrder: i,
    }));
    await db.insert(menuItems).values(itemsToInsert);

    await db.insert(menuImports).values({
      menuId: menu.id,
      sourceType: "sql_file",
      parsedAt: new Date(),
    });

    const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menu.id)).orderBy(menuItems.sortOrder);
    return NextResponse.json({ menu, items });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

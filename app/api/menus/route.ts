import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");
  try {
    const list = restaurantId && !Number.isNaN(Number(restaurantId))
      ? await db.select().from(menus).where(eq(menus.restaurantId, Number(restaurantId))).orderBy(menus.createdAt)
      : await db.select().from(menus).orderBy(menus.createdAt);
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
    const [row] = await db
      .insert(menus)
      .values({ restaurantId, name: name.trim() })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create menu" }, { status: 500 });
  }
}

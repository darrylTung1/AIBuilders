import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId)).orderBy(menuItems.sortOrder, menuItems.id);
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
  const [row] = await db.insert(menuItems).values({
    menuId,
    name: name.trim(),
    description: (body.description as string) ?? null,
    price,
    popularityScore: body.popularityScore != null ? String(body.popularityScore) : null,
    category: (body.category as string) ?? null,
    sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    imageUrl: (body.imageUrl as string) ?? null,
    isRecommended: Boolean(body.isRecommended),
    fontSizeTier: (body.fontSizeTier as string) ?? "normal",
    costEstimate: body.costEstimate != null ? String(body.costEstimate) : null,
  }).returning();
  return NextResponse.json(row);
}

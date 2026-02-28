import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menus, menuItems, restaurants } from "@/lib/db/schema";
import { enrichMenuWithAI } from "@/lib/ai/enrich-menu";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) {
    return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  }

  let options = { descriptions: true, recommendations: true };
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.descriptions === "boolean") options.descriptions = body.descriptions;
    if (typeof body.recommendations === "boolean") options.recommendations = body.recommendations;
  } catch {
    // use defaults
  }

  const [menu] = await db.select().from(menus).where(eq(menus.id, menuId));
  if (!menu) return NextResponse.json({ error: "Menu not found" }, { status: 404 });

  const items = await db
    .select()
    .from(menuItems)
    .where(eq(menuItems.menuId, menuId))
    .orderBy(menuItems.sortOrder);

  let restaurant: { cuisineType: string | null; theme: string | null } | null = null;
  if (menu.restaurantId) {
    const [r] = await db.select({ cuisineType: restaurants.cuisineType, theme: restaurants.theme }).from(restaurants).where(eq(restaurants.id, menu.restaurantId));
    restaurant = r ?? null;
  }

  const result = await enrichMenuWithAI(items, restaurant, options);

  // Apply updates to the database
  for (const u of result.items) {
    const updates: { description?: string; isRecommended?: boolean; fontSizeTier?: string } = {};
    if (u.description != null) updates.description = u.description;
    if (u.isRecommended != null) updates.isRecommended = u.isRecommended;
    if (u.fontSizeTier != null) updates.fontSizeTier = u.fontSizeTier;
    if (Object.keys(updates).length > 0) {
      await db
        .update(menuItems)
        .set(updates)
        .where(eq(menuItems.id, u.id));
    }
  }

  return NextResponse.json({
    ok: true,
    updated: result.updated,
    errors: result.errors,
    message: result.errors.length > 0
      ? `Enriched with ${result.updated} updates. Some items had errors: ${result.errors.join("; ")}`
      : `Enriched ${result.updated} item(s).`,
  });
}

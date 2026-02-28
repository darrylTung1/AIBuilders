import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menus, menuItems } from "@/lib/db/schema";
import { enrichMenuWithAI } from "@/lib/ai/enrich-menu";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) {
    return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  }

  let options = { images: true, recommendations: true };
  try {
    const body = await request.json().catch(() => ({}));
    if (typeof body.images === "boolean") options.images = body.images;
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

  // No restaurant context needed since we removed restaurant functionality
  const restaurant: { cuisineType: string | null; theme: string | null } | null = null;

  const result = await enrichMenuWithAI(items, options);

  // Apply updates to the database
  for (const u of result.items) {
    const updates: { imageUrl?: string; isRecommended?: boolean; fontSizeTier?: string } = {};
    if (u.imageUrl != null) updates.imageUrl = u.imageUrl;
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
      ? `Generated ${result.updated} images. Some items had errors.`
      : `Generated images for ${result.updated} item(s).`,
  });
}

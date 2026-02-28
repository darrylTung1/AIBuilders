import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: menuId, itemId } = await params;
  const mid = Number(menuId);
  const iid = Number(itemId);
  if (Number.isNaN(mid) || Number.isNaN(iid)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [row] = await db.select().from(menuItems).where(and(eq(menuItems.menuId, mid), eq(menuItems.id, iid)));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: menuId, itemId } = await params;
  const mid = Number(menuId);
  const iid = Number(itemId);
  if (Number.isNaN(mid) || Number.isNaN(iid)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await request.json() as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = String(body.price);
  if (body.popularityScore !== undefined) updates.popularityScore = body.popularityScore == null ? null : String(body.popularityScore);
  if (body.category !== undefined) updates.category = body.category;
  if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  if (typeof body.isRecommended === "boolean") updates.isRecommended = body.isRecommended;
  if (typeof body.fontSizeTier === "string") updates.fontSizeTier = body.fontSizeTier;
  if (body.costEstimate !== undefined) updates.costEstimate = body.costEstimate == null ? null : String(body.costEstimate);
  const [row] = await db.update(menuItems).set(updates).where(and(eq(menuItems.menuId, mid), eq(menuItems.id, iid))).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id: menuId, itemId } = await params;
  const mid = Number(menuId);
  const iid = Number(itemId);
  if (Number.isNaN(mid) || Number.isNaN(iid)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(menuItems).where(and(eq(menuItems.menuId, mid), eq(menuItems.id, iid)));
  return NextResponse.json({ ok: true });
}

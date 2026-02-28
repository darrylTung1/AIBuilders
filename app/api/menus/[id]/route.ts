import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menus } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const [row] = await db.select().from(menus).where(eq(menus.id, id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const body = await request.json() as Record<string, unknown>;
  const updates: { name?: string; version?: number } = {};
  if (typeof body.name === "string") updates.name = body.name;
  if (typeof body.version === "number") updates.version = body.version;
  const [row] = await db.update(menus).set(updates).where(eq(menus.id, id)).returning();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number((await params).id);
  if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await db.delete(menus).where(eq(menus.id, id));
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { computeMenuAnalytics } from "@/lib/analytics/profitability";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const menuId = Number((await params).id);
  if (Number.isNaN(menuId)) return NextResponse.json({ error: "Invalid menu id" }, { status: 400 });
  const items = await db.select().from(menuItems).where(eq(menuItems.menuId, menuId)).orderBy(menuItems.sortOrder);
  const analytics = computeMenuAnalytics(items);
  return NextResponse.json({ items: analytics });
}

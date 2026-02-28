import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";

export async function GET() {
  try {
    const list = await db.select().from(restaurants).orderBy(restaurants.createdAt);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to list restaurants" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cuisineType, theme } = body as { name: string; cuisineType?: string; theme?: string };
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const [row] = await db
      .insert(restaurants)
      .values({ name: name.trim(), cuisineType: cuisineType ?? null, theme: theme ?? null })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create restaurant" }, { status: 500 });
  }
}

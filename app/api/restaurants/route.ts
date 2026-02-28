import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { restaurants } from "@/lib/db/schema";

export async function GET() {
  try {
    const list = await db.select().from(restaurants).orderBy(restaurants.createdAt);
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "";
    if (message.includes("ECONNREFUSED") || message.includes("connection") || message.includes("connect")) {
      return NextResponse.json(
        { error: "Database not connected. Set DATABASE_URL in .env.local and run migrations (npm run db:generate && npm run db:migrate)." },
        { status: 503 }
      );
    }
    if (message.includes("relation") && message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database tables missing. Run: npm run db:generate && npm run db:migrate" },
        { status: 503 }
      );
    }
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
    const [row] = await db
      .insert(restaurants)
      .values({ name: name.trim(), cuisineType: cuisineType ?? null, theme: theme ?? null })
      .returning();
    return NextResponse.json(row);
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : "";
    if (message.includes("ECONNREFUSED") || message.includes("connection") || message.includes("connect")) {
      return NextResponse.json(
        { error: "Database not connected. Set DATABASE_URL in .env.local and run: npm run db:generate && npm run db:migrate" },
        { status: 503 }
      );
    }
    if (message.includes("relation") && message.includes("does not exist")) {
      return NextResponse.json(
        { error: "Database tables missing. Run: npm run db:generate && npm run db:migrate" },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: message || "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

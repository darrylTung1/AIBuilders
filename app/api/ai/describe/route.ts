import { NextResponse } from "next/server";
import { generateDescription } from "@/lib/ai/llm";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { itemName: string; cuisineType?: string; theme?: string };
    const { itemName, cuisineType, theme } = body;
    if (!itemName?.trim()) return NextResponse.json({ error: "itemName is required" }, { status: 400 });
    const description = await generateDescription({ itemName: itemName.trim(), cuisineType, theme });
    return NextResponse.json({ description });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Description generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

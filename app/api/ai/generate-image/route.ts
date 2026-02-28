import { NextResponse } from "next/server";
import { generateFoodImage } from "@/lib/ai/wavespeed";
import { uploadImage } from "@/lib/storage/upload";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { itemName: string; cuisineType?: string; theme?: string };
    const { itemName, cuisineType, theme } = body;
    if (!itemName?.trim()) return NextResponse.json({ error: "itemName is required" }, { status: 400 });
    const buffer = await generateFoodImage({ itemName: itemName.trim(), cuisineType, theme });
    const url = await uploadImage(buffer, `food-${itemName.replace(/\s/g, "-")}.png`);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

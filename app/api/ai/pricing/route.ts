import { NextResponse } from "next/server";
import { getPricingSuggestions } from "@/lib/ai/llm";

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      itemName: string;
      description?: string;
      currentPrice: number;
      cuisineType?: string;
    };
    const { itemName, currentPrice, description, cuisineType } = body;
    if (!itemName?.trim() || typeof currentPrice !== "number") {
      return NextResponse.json({ error: "itemName and currentPrice are required" }, { status: 400 });
    }
    const suggestion = await getPricingSuggestions({
      itemName: itemName.trim(),
      description,
      currentPrice,
      cuisineType,
    });
    return NextResponse.json({ suggestion });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Pricing suggestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

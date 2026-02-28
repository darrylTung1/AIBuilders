import { NextResponse } from "next/server";
import { extractTextFromImage } from "@/lib/ai/ocr";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/png";
    const text = await extractTextFromImage(buffer, mimeType);
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OCR failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/storage/upload";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer, file.name);
    return NextResponse.json({ url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

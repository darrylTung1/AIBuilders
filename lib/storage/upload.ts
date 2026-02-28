/**
 * Upload buffer to cloud storage and return public URL.
 * Supports Cloudinary (via CLOUDINARY_URL) or fallback to local public/uploads.
 */
export async function uploadImage(buffer: Buffer, filename: string, folder = "menu-items"): Promise<string> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    return uploadToCloudinary(buffer, filename, folder);
  }
  return uploadToLocal(buffer, filename);
}

/** Upload PDF buffer to local public folder (Cloudinary raw upload optional). */
export async function uploadPdf(buffer: Buffer, filename: string): Promise<string> {
  const path = await import("path");
  const fs = await import("fs/promises");
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safeName), buffer);
  return `${baseUrl}/uploads/${safeName}`;
}

async function uploadToCloudinary(buffer: Buffer, filename: string, folder: string): Promise<string> {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (!cloudinaryUrl) throw new Error("CLOUDINARY_URL not set");
  const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (!match) throw new Error("Invalid CLOUDINARY_URL (use cloudinary://API_KEY:API_SECRET@CLOUD_NAME)");
  const [, apiKey, apiSecret, cloudName] = match;

  const formData = new FormData();
  formData.append("file", new Blob([new Uint8Array(buffer)]), filename);
  formData.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET ?? "ml_default");
  formData.append("folder", folder);
  formData.append("api_key", apiKey);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { secure_url: string };
  return data.secure_url;
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const path = await import("path");
  const fs = await import("fs/promises");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, safeName), buffer);
  return `${baseUrl}/uploads/${safeName}`;
}

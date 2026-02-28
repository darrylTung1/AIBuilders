/**
 * WaveSpeed AI image generation for food photography.
 * Requires WAVESPEED_API_KEY.
 */

export async function generateFoodImage(params: {
  itemName: string;
  cuisineType?: string;
  theme?: string;
}): Promise<Buffer> {
  const apiKey = process.env.WAVESPEED_API_KEY;
  if (!apiKey) throw new Error("WAVESPEED_API_KEY is not set");

  const { itemName, cuisineType = "", theme = "" } = params;
  const style = [cuisineType, theme].filter(Boolean).join(", ") || "restaurant";
  const prompt = `Professional food photography, ${style} style, ${itemName}, studio lighting, high resolution, appetizing, clean plate`;

  const res = await fetch("https://api.wavespeed.ai/api/v3/wavespeed-ai/flux-dev", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      size: "1024x1024",
      num_inference_steps: 28,
      guidance_scale: 3.5,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WaveSpeed API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { image?: string; url?: string };
  const imageUrl = data.image ?? data.url;
  if (!imageUrl) throw new Error("WaveSpeed did not return an image");

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error("Failed to fetch generated image");
  const arrayBuffer = await imgRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

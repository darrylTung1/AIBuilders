/**
 * OCR: extract text from menu image.
 * Uses OpenAI Vision as fallback when no dedicated OCR API is configured.
 */

export async function extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return extractWithOpenAIVision(imageBuffer, mimeType, openaiKey);
  }
  throw new Error("Set OPENAI_API_KEY for OCR (image-to-text) support.");
}

async function extractWithOpenAIVision(
  imageBuffer: Buffer,
  mimeType: string,
  apiKey: string
): Promise<string> {
  const base64 = imageBuffer.toString("base64");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this menu image. Preserve structure: list each line or block of text. If you see dish names and prices, list them clearly (e.g. 'Dish Name - $XX.XX').",
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 1500,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI Vision error: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  return content.trim();
}

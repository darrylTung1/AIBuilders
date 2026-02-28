/**
 * Computer Vision: analyze competitor menu image (items, prices, layout).
 */

export type MenuAnalysisResult = {
  items: { name: string; price?: string; description?: string }[];
  layoutNotes?: string;
  raw?: string;
};

export async function analyzeMenuImage(imageBuffer: Buffer, mimeType: string): Promise<MenuAnalysisResult> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) throw new Error("Set OPENAI_API_KEY for menu image analysis.");

  const base64 = imageBuffer.toString("base64");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
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
              text: `Analyze this menu image (competitor menu). Reply with a JSON object only, no markdown, with this structure:
{
  "items": [ { "name": "Dish name", "price": "12.99", "description": "optional" } ],
  "layoutNotes": "Brief note on layout or sections"
}`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 2000,
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI Vision error: ${res.status} ${t}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "";
  try {
    const parsed = JSON.parse(content.replace(/^```json\s*|\s*```$/g, "")) as MenuAnalysisResult;
    return { ...parsed, raw: content };
  } catch {
    return { items: [], layoutNotes: content, raw: content };
  }
}

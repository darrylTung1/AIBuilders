/**
 * LLM helpers for menu description and pricing suggestions.
 * Uses OpenAI or Anthropic based on env (OPENAI_API_KEY or ANTHROPIC_API_KEY).
 */

export async function generateDescription(params: {
  itemName: string;
  cuisineType?: string;
  theme?: string;
}): Promise<string> {
  const { itemName, cuisineType = "", theme = "" } = params;
  const prompt = `Write a short, appetizing menu description (1-2 sentences) for this dish. Be concise and evocative. Do not include the dish name in the description.
Dish: ${itemName}
Cuisine/theme: ${[cuisineType, theme].filter(Boolean).join(", ") || "general"}

Description:`;

  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 150,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic();
    const res = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 150,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content.find((c) => c.type === "text");
    return (text && "text" in text ? text.text : "").trim();
  }
  throw new Error("Set OPENAI_API_KEY or ANTHROPIC_API_KEY for description generation.");
}

export async function getPricingSuggestions(params: {
  itemName: string;
  description?: string;
  currentPrice: number;
  cuisineType?: string;
}): Promise<string> {
  const { itemName, description = "", currentPrice, cuisineType = "" } = params;
  const prompt = `Suggest a price range (in the same currency, e.g. USD) for this menu item. Reply in 1-2 short sentences with a range (e.g. "Consider $12–15").
Item: ${itemName}
Description: ${description}
Current price: ${currentPrice}
Context: ${cuisineType || "restaurant"}

Suggestion:`;

  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic();
    const res = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content.find((c) => c.type === "text");
    return (text && "text" in text ? text.text : "").trim();
  }
  throw new Error("Set OPENAI_API_KEY or ANTHROPIC_API_KEY for pricing suggestions.");
}

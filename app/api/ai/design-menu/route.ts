import { NextResponse } from "next/server";

type MenuItem = {
  name: string;
  description?: string | null;
  price: number | string;
  category?: string | null;
  popularityScore?: number | string | null;
  profitMargin?: number | null;
};

type DesignRequest = {
  restaurantName?: string;
  cuisineType?: string;
  theme?: string;
  targetCustomer?: string;
  items?: MenuItem[];
};

export type MenuDesignSuggestion = {
  template: "classic" | "modern" | "elegant" | "rustic";
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: string;
    body: string;
    style: string;
  };
  layout: {
    columns: 1 | 2;
    showImages: boolean;
    showDescriptions: boolean;
    categoryOrder: string[];
  };
  reasoning: string;
  chefRecommendations?: string[];
  enhancedItems?: Array<{
    name: string;
    enhancedDescription?: string;
    badge?: string;
    highlight?: boolean;
  }>;
  winePairings?: Array<{
    itemName: string;
    wine: string;
  }>;
};

// Build the AI prompt based on user's guide
function buildDesignPrompt(params: DesignRequest): string {
  const { restaurantName, cuisineType, theme, targetCustomer, items = [] } = params;

  const menuData = items.map(item => ({
    name: item.name,
    description: item.description || "",
    price: typeof item.price === "string" ? parseFloat(item.price) : item.price,
    category: item.category || "Uncategorized",
    popularity: item.popularityScore ? Number(item.popularityScore) : 50,
    profitMargin: item.profitMargin || "unknown",
  }));

  const categories = [...new Set(menuData.map(i => i.category))];

  return `You are a professional restaurant menu designer and menu engineer. Analyze this menu data and create a comprehensive design recommendation.

RESTAURANT CONTEXT:
- Name: ${restaurantName || "Restaurant"}
- Cuisine Type: ${cuisineType || "General"}
- Theme/Atmosphere: ${theme || "Not specified"}
- Target Customer: ${targetCustomer || "General dining"}

MENU ITEMS (${menuData.length} items):
${JSON.stringify(menuData, null, 2)}

EXISTING CATEGORIES: ${categories.join(", ")}

YOUR TASKS:

1. **Template Selection** - Choose the best template:
   - "elegant" for fine dining, French, upscale
   - "classic" for Italian, traditional, warm atmospheres
   - "modern" for contemporary, fusion, casual upscale
   - "rustic" for BBQ, Mexican, comfort food, casual

2. **Color Scheme** - Provide hex colors that match the cuisine and atmosphere:
   - primary: Main brand color for headings
   - secondary: Supporting color for accents
   - accent: Highlight color for badges/prices
   - background: Page background
   - text: Main text color

3. **Category Ordering** - Reorder categories logically:
   - Starters/Appetizers first
   - Mains in the middle
   - Desserts and Drinks last

4. **Chef's Recommendations** - Select 2-3 items to highlight based on:
   - High popularity (>80)
   - Good profit potential
   - Signature dishes that represent the restaurant

5. **Item Enhancements**:
   - For items with popularity >90: Add "Popular" badge
   - For items with high profit margin: Suggest highlighting
   - For expensive mains (>$20): Suggest a wine pairing
   - For items with missing/weak descriptions: Suggest an enhanced 8-word description

RESPOND IN THIS EXACT JSON FORMAT:
{
  "template": "modern|classic|elegant|rustic",
  "colorScheme": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex"
  },
  "typography": {
    "heading": "Font name",
    "body": "Font name",
    "style": "Brief description of typography approach"
  },
  "layout": {
    "columns": 1 or 2,
    "showImages": true/false,
    "showDescriptions": true/false,
    "categoryOrder": ["Category1", "Category2", ...]
  },
  "reasoning": "2-3 sentences explaining your design choices",
  "chefRecommendations": ["Item Name 1", "Item Name 2", "Item Name 3"],
  "enhancedItems": [
    {
      "name": "Item Name",
      "enhancedDescription": "New appetizing 8-word description",
      "badge": "Popular|Chef's Pick|House Favorite|null",
      "highlight": true/false
    }
  ],
  "winePairings": [
    {
      "itemName": "Expensive Main Name",
      "wine": "Wine recommendation"
    }
  ]
}

Only output valid JSON, no other text.`;
}

// Fallback design when no AI is available
function getFallbackDesign(params: DesignRequest): MenuDesignSuggestion {
  const { cuisineType, theme, items = [] } = params;
  const cuisine = (cuisineType || "").toLowerCase();
  const atmosphere = (theme || "").toLowerCase();
  const categories = [...new Set(items.map(i => i.category || "Menu"))];

  const defaultOrder = ["starters", "appetizers", "salads", "soups", "mains", "entrees", "pasta", "pizza", "seafood", "meat", "sides", "desserts", "drinks", "beverages"];
  const sortedCategories = [...categories].sort((a, b) => {
    const aLower = (a || "").toLowerCase();
    const bLower = (b || "").toLowerCase();
    const aIdx = defaultOrder.findIndex(d => aLower.includes(d));
    const bIdx = defaultOrder.findIndex(d => bLower.includes(d));
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  // Find chef recommendations (top 3 by popularity)
  const sortedItems = [...items]
    .filter(i => i.popularityScore)
    .sort((a, b) => Number(b.popularityScore || 0) - Number(a.popularityScore || 0))
    .slice(0, 3);
  const chefRecommendations = sortedItems.map(i => i.name);

  // Enhanced items with badges
  const enhancedItems = items.map(item => {
    const pop = Number(item.popularityScore || 0);
    const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
    return {
      name: item.name,
      badge: pop >= 90 ? "Popular" : chefRecommendations.includes(item.name) ? "Chef's Pick" : undefined,
      highlight: pop >= 80 || price >= 20,
    };
  }).filter(i => i.badge || i.highlight);

  // Base design selection
  if (cuisine.includes("italian") || cuisine.includes("pizza") || cuisine.includes("pasta")) {
    return {
      template: "classic",
      colorScheme: { primary: "#8B4513", secondary: "#D2691E", accent: "#228B22", background: "#FFF8DC", text: "#2F1810" },
      typography: { heading: "Playfair Display", body: "Lora", style: "Warm and inviting with serif fonts" },
      layout: { columns: 1, showImages: true, showDescriptions: true, categoryOrder: sortedCategories },
      reasoning: "Classic Italian trattoria style with warm earth tones and elegant serif typography.",
      chefRecommendations,
      enhancedItems,
    };
  }

  if (cuisine.includes("french") || atmosphere.includes("upscale") || atmosphere.includes("fine dining") || atmosphere.includes("elegant")) {
    return {
      template: "elegant",
      colorScheme: { primary: "#1C1C1C", secondary: "#C9A227", accent: "#8B0000", background: "#FFFEF7", text: "#1C1C1C" },
      typography: { heading: "Cormorant Garamond", body: "EB Garamond", style: "Refined and sophisticated" },
      layout: { columns: 1, showImages: false, showDescriptions: true, categoryOrder: sortedCategories },
      reasoning: "Elegant fine-dining presentation with sophisticated typography and gold accents.",
      chefRecommendations,
      enhancedItems,
    };
  }

  if (cuisine.includes("mexican") || cuisine.includes("bbq") || atmosphere.includes("rustic") || atmosphere.includes("casual")) {
    return {
      template: "rustic",
      colorScheme: { primary: "#5D4037", secondary: "#BF360C", accent: "#FFC107", background: "#EFEBE9", text: "#3E2723" },
      typography: { heading: "Bebas Neue", body: "Roboto Slab", style: "Bold and hearty" },
      layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: sortedCategories },
      reasoning: "Rustic style with warm earth tones and bold typography for a welcoming casual atmosphere.",
      chefRecommendations,
      enhancedItems,
    };
  }

  // Default modern
  return {
    template: "modern",
    colorScheme: { primary: "#102A43", secondary: "#486581", accent: "#F59E0B", background: "#F8FAFC", text: "#1E293B" },
    typography: { heading: "Inter", body: "Inter", style: "Clean and professional" },
    layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: sortedCategories },
    reasoning: "Modern, clean design with navy and gold accents that works well for any cuisine type.",
    chefRecommendations,
    enhancedItems,
  };
}

async function callAI(prompt: string): Promise<string> {
  if (process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2000,
      temperature: 0.7,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }

  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const anthropic = new Anthropic();
    const res = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const text = res.content.find((c) => c.type === "text");
    return (text && "text" in text ? text.text : "").trim();
  }

  throw new Error("NO_AI_KEY");
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as DesignRequest;

    // Try AI-powered design first
    try {
      const prompt = buildDesignPrompt(body);
      const aiResponse = await callAI(prompt);

      // Parse the JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as MenuDesignSuggestion;

        // Validate required fields
        if (parsed.template && parsed.colorScheme && parsed.layout) {
          return NextResponse.json(parsed);
        }
      }
    } catch (aiError) {
      // If AI fails, fall back to rule-based design
      console.log("AI design failed, using fallback:", aiError instanceof Error ? aiError.message : "unknown");
    }

    // Fallback to rule-based design
    const fallback = getFallbackDesign(body);
    return NextResponse.json(fallback);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Design suggestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

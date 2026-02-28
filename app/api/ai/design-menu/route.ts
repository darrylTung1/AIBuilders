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
    badge?: string;
    highlight?: boolean;
  }>;
};

// Smart design selection based on cuisine/theme
function getDesignSuggestion(params: DesignRequest): MenuDesignSuggestion {
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

  // Italian cuisine
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

  // French / Fine dining
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

  // Japanese
  if (cuisine.includes("japanese") || cuisine.includes("sushi") || cuisine.includes("ramen")) {
    return {
      template: "modern",
      colorScheme: { primary: "#1a1a2e", secondary: "#e94560", accent: "#c9a227", background: "#f5f5f5", text: "#1a1a2e" },
      typography: { heading: "Noto Sans", body: "Inter", style: "Clean, minimal with bold accents" },
      layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: sortedCategories },
      reasoning: "Modern Japanese aesthetic with clean lines and minimalist design.",
      chefRecommendations,
      enhancedItems,
    };
  }

  // Mexican / BBQ / Casual
  if (cuisine.includes("mexican") || cuisine.includes("bbq") || cuisine.includes("burger") || atmosphere.includes("rustic") || atmosphere.includes("casual")) {
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

export async function POST(request: Request) {
  try {
    const body = await request.json() as DesignRequest;
    const design = getDesignSuggestion(body);
    return NextResponse.json(design);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Design suggestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

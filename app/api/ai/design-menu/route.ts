import { NextResponse } from "next/server";

type DesignRequest = {
  restaurantName?: string;
  cuisineType?: string;
  theme?: string;
  categories?: string[];
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
};

// Intelligent design selection based on cuisine/theme
function suggestDesign(params: DesignRequest): MenuDesignSuggestion {
  const { cuisineType = "", theme = "", categories = [] } = params;
  const cuisine = cuisineType.toLowerCase();
  const atmosphere = theme.toLowerCase();

  // Default category order (sorted logically)
  const defaultOrder = ["starters", "appetizers", "salads", "soups", "mains", "entrees", "pasta", "pizza", "seafood", "meat", "sides", "desserts", "drinks", "beverages"];
  const sortedCategories = [...categories].sort((a, b) => {
    const aIdx = defaultOrder.findIndex(d => a.toLowerCase().includes(d));
    const bIdx = defaultOrder.findIndex(d => b.toLowerCase().includes(d));
    if (aIdx === -1 && bIdx === -1) return 0;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });

  // Italian cuisine
  if (cuisine.includes("italian") || cuisine.includes("pizza") || cuisine.includes("pasta")) {
    return {
      template: "classic",
      colorScheme: {
        primary: "#8B4513",
        secondary: "#D2691E",
        accent: "#228B22",
        background: "#FFF8DC",
        text: "#2F1810",
      },
      typography: {
        heading: "Playfair Display",
        body: "Lora",
        style: "Warm and inviting with serif fonts",
      },
      layout: {
        columns: 1,
        showImages: true,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Classic Italian trattoria style with warm earth tones, elegant serif typography, and a single-column layout that lets each dish shine.",
    };
  }

  // Japanese cuisine
  if (cuisine.includes("japanese") || cuisine.includes("sushi") || cuisine.includes("ramen")) {
    return {
      template: "modern",
      colorScheme: {
        primary: "#1a1a2e",
        secondary: "#e94560",
        accent: "#c9a227",
        background: "#f5f5f5",
        text: "#1a1a2e",
      },
      typography: {
        heading: "Noto Sans JP",
        body: "Inter",
        style: "Clean, minimal with bold accents",
      },
      layout: {
        columns: 2,
        showImages: true,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Modern Japanese aesthetic with clean lines, minimalist design, and strategic use of red and gold accents for an authentic feel.",
    };
  }

  // French/upscale
  if (cuisine.includes("french") || atmosphere.includes("upscale") || atmosphere.includes("fine dining") || atmosphere.includes("elegant")) {
    return {
      template: "elegant",
      colorScheme: {
        primary: "#1C1C1C",
        secondary: "#C9A227",
        accent: "#8B0000",
        background: "#FFFEF7",
        text: "#1C1C1C",
      },
      typography: {
        heading: "Cormorant Garamond",
        body: "EB Garamond",
        style: "Refined and sophisticated with classic serifs",
      },
      layout: {
        columns: 1,
        showImages: false,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Elegant fine-dining presentation with sophisticated typography, gold accents, and focus on descriptions rather than images for a luxury feel.",
    };
  }

  // Mexican cuisine
  if (cuisine.includes("mexican") || cuisine.includes("taco") || cuisine.includes("tex-mex")) {
    return {
      template: "rustic",
      colorScheme: {
        primary: "#C65D07",
        secondary: "#2D572C",
        accent: "#FFD700",
        background: "#FEF3E2",
        text: "#3D2914",
      },
      typography: {
        heading: "Oswald",
        body: "Open Sans",
        style: "Bold and vibrant",
      },
      layout: {
        columns: 2,
        showImages: true,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Vibrant rustic design with warm orange and green tones reflecting traditional Mexican colors, bold typography for a festive atmosphere.",
    };
  }

  // American/casual
  if (cuisine.includes("american") || cuisine.includes("burger") || atmosphere.includes("casual") || atmosphere.includes("family")) {
    return {
      template: "modern",
      colorScheme: {
        primary: "#2C3E50",
        secondary: "#E74C3C",
        accent: "#F39C12",
        background: "#FFFFFF",
        text: "#2C3E50",
      },
      typography: {
        heading: "Montserrat",
        body: "Open Sans",
        style: "Clean and approachable",
      },
      layout: {
        columns: 2,
        showImages: true,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Modern American diner style with clean lines, approachable typography, and a two-column layout perfect for diverse menu offerings.",
    };
  }

  // BBQ/rustic
  if (cuisine.includes("bbq") || cuisine.includes("grill") || atmosphere.includes("rustic")) {
    return {
      template: "rustic",
      colorScheme: {
        primary: "#5D4037",
        secondary: "#BF360C",
        accent: "#FFC107",
        background: "#EFEBE9",
        text: "#3E2723",
      },
      typography: {
        heading: "Bebas Neue",
        body: "Roboto Slab",
        style: "Bold and hearty",
      },
      layout: {
        columns: 1,
        showImages: true,
        showDescriptions: true,
        categoryOrder: sortedCategories,
      },
      reasoning: "Rustic smokehouse aesthetic with rich browns, bold condensed headings, and warm background tones that evoke wood and fire.",
    };
  }

  // Default - modern clean design
  return {
    template: "modern",
    colorScheme: {
      primary: "#102A43",
      secondary: "#486581",
      accent: "#F59E0B",
      background: "#F8FAFC",
      text: "#1E293B",
    },
    typography: {
      heading: "Inter",
      body: "Inter",
      style: "Clean and professional",
    },
    layout: {
      columns: 2,
      showImages: true,
      showDescriptions: true,
      categoryOrder: sortedCategories,
    },
    reasoning: "Modern, clean design with navy and gold accents that works well for any cuisine type. Professional and easy to read.",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as DesignRequest;
    const design = suggestDesign(body);
    return NextResponse.json(design);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Design suggestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * AI-powered menu enrichment using restaurant and menu data from the database.
 * Generates descriptions, sets recommended badges from popularity, and optionally suggests prices.
 */

import { generateDescription } from "./llm";
import type { MenuItem, Restaurant } from "@/lib/db/schema";

export type EnrichOptions = {
  descriptions?: boolean;   // Generate AI descriptions for items that lack one
  recommendations?: boolean; // Set is_recommended and font_size_tier from popularity
  descriptionsOnly?: boolean; // Shorthand: only fill descriptions
};

export type EnrichResult = {
  updated: number;
  errors: string[];
  items: { id: number; name: string; description?: string; isRecommended?: boolean; fontSizeTier?: string }[];
};

export async function enrichMenuWithAI(
  items: MenuItem[],
  restaurant: Pick<Restaurant, "cuisineType" | "theme"> | null,
  options: EnrichOptions
): Promise<EnrichResult> {
  const { descriptions = true, recommendations = true } = options;
  const cuisineType = restaurant?.cuisineType ?? undefined;
  const theme = restaurant?.theme ?? undefined;
  const errors: string[] = [];
  const updated: EnrichResult["items"] = [];

  // Set recommended and font tier from popularity
  if (recommendations && items.length > 0) {
    const scores = items.map((i) => (i.popularityScore != null ? Number(i.popularityScore) : 0));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    const range = max - min;
    for (const item of items) {
      const pop = item.popularityScore != null ? Number(item.popularityScore) : null;
      let isRecommended = false;
      let fontSizeTier: "high" | "normal" | "low" = "normal";
      if (pop != null && range > 0) {
        const pct = (pop - min) / range;
        isRecommended = pct >= 0.8;
        fontSizeTier = pct >= 0.8 ? "high" : pct <= 0.2 ? "low" : "normal";
      }
      updated.push({
        id: item.id,
        name: item.name,
        isRecommended,
        fontSizeTier,
      });
    }
  }

  // Generate descriptions for items that don't have one
  if (descriptions) {
    for (const item of items) {
      const hasDescription = item.description != null && String(item.description).trim().length > 0;
      if (!hasDescription) {
        try {
          const description = await generateDescription({
            itemName: item.name,
            cuisineType,
            theme,
          });
          if (description) {
            const existing = updated.find((u) => u.id === item.id);
            if (existing) existing.description = description;
            else updated.push({ id: item.id, name: item.name, description });
          }
        } catch (e) {
          errors.push(`${item.name}: ${e instanceof Error ? e.message : "Description generation failed"}`);
        }
      } else if (recommendations) {
        const existing = updated.find((u) => u.id === item.id);
        if (!existing) updated.push({ id: item.id, name: item.name });
      }
    }
  }

  return {
    updated: updated.length,
    errors,
    items: updated,
  };
}

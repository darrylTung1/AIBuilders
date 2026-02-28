/**
 * AI-powered menu enrichment using WaveSpeed for image generation.
 * Generates food photos for menu items and sets recommended badges from popularity.
 */

import { generateFoodImage } from "./wavespeed";
import { uploadImage } from "@/lib/storage/upload";
import type { MenuItem, Restaurant } from "@/lib/db/schema";

export type EnrichOptions = {
  images?: boolean;          // Generate AI food images for items that lack one
  recommendations?: boolean; // Set is_recommended and font_size_tier from popularity
};

export type EnrichResult = {
  updated: number;
  errors: string[];
  items: { id: number; name: string; imageUrl?: string; isRecommended?: boolean; fontSizeTier?: string }[];
};

export async function enrichMenuWithAI(
  items: MenuItem[],
  restaurant: Pick<Restaurant, "cuisineType" | "theme"> | null,
  options: EnrichOptions
): Promise<EnrichResult> {
  const { images = true, recommendations = true } = options;
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

  // Generate images for items that don't have one
  if (images) {
    for (const item of items) {
      const hasImage = item.imageUrl != null && String(item.imageUrl).trim().length > 0;
      if (!hasImage) {
        try {
          // Generate food image with WaveSpeed
          const imageBuffer = await generateFoodImage({
            itemName: item.name,
            cuisineType,
            theme,
          });
          
          // Upload and get URL
          const filename = `food-${item.id}-${item.name.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
          const imageUrl = await uploadImage(imageBuffer, filename);
          
          if (imageUrl) {
            const existing = updated.find((u) => u.id === item.id);
            if (existing) existing.imageUrl = imageUrl;
            else updated.push({ id: item.id, name: item.name, imageUrl });
          }
        } catch (e) {
          errors.push(`${item.name}: ${e instanceof Error ? e.message : "Image generation failed"}`);
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

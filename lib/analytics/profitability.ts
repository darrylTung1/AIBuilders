import type { MenuItem } from "@/lib/db/schema";

export type ItemAnalytics = {
  id: number;
  name: string;
  price: number;
  cost: number | null;
  margin: number | null;
  marginPercent: number | null;
  popularityScore: number | null;
  isRecommended: boolean;
  fontSizeTier: string | null;
};

export function computeMenuAnalytics(items: MenuItem[]): ItemAnalytics[] {
  const prices = items.map((i) => Number(i.price));
  const maxPrice = Math.max(...prices, 0);
  const minPopularity = Math.min(
    ...items.map((i) => (i.popularityScore != null ? Number(i.popularityScore) : 0)),
    0
  );
  const maxPopularity = Math.max(
    ...items.map((i) => (i.popularityScore != null ? Number(i.popularityScore) : 0)),
    0
  );

  return items.map((item) => {
    const price = Number(item.price);
    const cost = item.costEstimate != null ? Number(item.costEstimate) : null;
    const margin = cost != null ? price - cost : null;
    const marginPercent = margin != null && price > 0 ? (margin / price) * 100 : null;
    const pop = item.popularityScore != null ? Number(item.popularityScore) : null;
    return {
      id: item.id,
      name: item.name,
      price,
      cost,
      margin,
      marginPercent,
      popularityScore: pop,
      isRecommended: item.isRecommended ?? false,
      fontSizeTier: item.fontSizeTier,
    };
  });
}

export function getPopularityTier(
  popularityScore: number | null,
  minPop: number,
  maxPop: number
): "high" | "normal" | "low" {
  if (popularityScore == null || maxPop <= minPop) return "normal";
  const range = maxPop - minPop;
  const pct = (popularityScore - minPop) / range;
  if (pct >= 0.8) return "high";
  if (pct <= 0.2) return "low";
  return "normal";
}

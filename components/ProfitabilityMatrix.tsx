"use client";

import { Star, Puzzle, Turtle, Dog, Info } from "lucide-react";
import type { MenuItem } from "./MenuItemCard";

interface ProfitabilityMatrixProps {
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}

type QuadrantType = "star" | "plow-horse" | "puzzle" | "dog";

interface QuadrantInfo {
  id: QuadrantType;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

const quadrants: QuadrantInfo[] = [
  {
    id: "star",
    title: "Stars",
    subtitle: "High Profit · High Popularity",
    icon: Star,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    description: "Your menu champions. Promote these heavily.",
  },
  {
    id: "plow-horse",
    title: "Plow Horses",
    subtitle: "Low Profit · High Popularity",
    icon: Turtle,
    color: "text-gold-600",
    bgColor: "bg-gold-50",
    borderColor: "border-gold-200",
    description: "Popular but low margin. Consider price increases.",
  },
  {
    id: "puzzle",
    title: "Puzzles",
    subtitle: "High Profit · Low Popularity",
    icon: Puzzle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "High margin but overlooked. Improve visibility.",
  },
  {
    id: "dog",
    title: "Dogs",
    subtitle: "Low Profit · Low Popularity",
    icon: Dog,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    description: "Consider removing or reimagining these items.",
  },
];

function classifyItem(item: MenuItem): QuadrantType {
  const isHighProfit = item.profitMargin >= 50;
  const isHighPopularity = item.popularityScore >= 70;

  if (isHighProfit && isHighPopularity) return "star";
  if (!isHighProfit && isHighPopularity) return "plow-horse";
  if (isHighProfit && !isHighPopularity) return "puzzle";
  return "dog";
}

function QuadrantCard({
  quadrant,
  items,
  onItemClick,
}: {
  quadrant: QuadrantInfo;
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}) {
  const Icon = quadrant.icon;

  return (
    <div className={`card border-2 ${quadrant.borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`px-4 py-3 ${quadrant.bgColor} border-b ${quadrant.borderColor}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${quadrant.color}`} />
          <div>
            <h3 className={`font-semibold ${quadrant.color}`}>{quadrant.title}</h3>
            <p className="text-xs text-slate-500">{quadrant.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="p-3">
        {items.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">No items in this quadrant</p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 5).map((item) => (
              <li
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900 truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.category}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium text-navy-900">${item.price.toFixed(2)}</p>
                  <p className="text-slate-500">{item.profitMargin.toFixed(0)}% margin</p>
                </div>
              </li>
            ))}
            {items.length > 5 && (
              <li className="text-center text-xs text-slate-400 py-1">
                +{items.length - 5} more items
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Footer with count */}
      <div className={`px-4 py-2 ${quadrant.bgColor} border-t ${quadrant.borderColor}`}>
        <p className="text-xs text-slate-600">{quadrant.description}</p>
      </div>
    </div>
  );
}

export function ProfitabilityMatrix({ items, onItemClick }: ProfitabilityMatrixProps) {
  const classified = {
    star: items.filter((i) => classifyItem(i) === "star"),
    "plow-horse": items.filter((i) => classifyItem(i) === "plow-horse"),
    puzzle: items.filter((i) => classifyItem(i) === "puzzle"),
    dog: items.filter((i) => classifyItem(i) === "dog"),
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Menu Engineering Matrix</h2>
          <p className="text-slate-500 text-sm">Classify items by profitability and popularity</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4" />
          <span className="text-xs">Click items for details</span>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quadrants.map((quadrant) => (
          <QuadrantCard
            key={quadrant.id}
            quadrant={quadrant}
            items={classified[quadrant.id]}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <span>High Margin</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <span>Low Margin</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gold-400" />
            <span>High Popularity</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span>Low Popularity</span>
          </div>
        </div>
      </div>
    </div>
  );
}

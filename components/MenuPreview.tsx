"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/db/schema";

type Props = {
  items: MenuItem[];
  title?: string;
};

function tierClass(tier: string | null): string {
  switch (tier) {
    case "high":
      return "font-tier-high text-xl font-semibold text-stone-900";
    case "low":
      return "font-tier-low text-sm text-stone-500";
    default:
      return "font-tier-normal text-base text-stone-800";
  }
}

export function MenuPreview({ items, title = "Menu" }: Props) {
  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 max-w-lg">
      <h2 className="text-2xl font-semibold text-stone-800 border-b border-stone-200 pb-2 mb-4">{title}</h2>
      <div className="space-y-6">
        {Object.entries(byCategory).map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-2">{category}</h3>
            <ul className="space-y-3">
              {catItems.map((item) => (
                <li key={item.id} className="flex gap-3">
                  {item.imageUrl && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-stone-100">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={tierClass(item.fontSizeTier ?? "normal")}>{item.name}</span>
                      {item.isRecommended && (
                        <span className="flex-shrink-0 rounded bg-amber-500 text-white text-xs px-2 py-0.5 font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-stone-600 mt-0.5">{item.description}</p>
                    )}
                    <p className="text-stone-700 font-medium mt-1">${Number(item.price).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

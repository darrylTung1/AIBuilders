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
    <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-5 max-w-lg">
      <h2 className="text-xl font-bold text-stone-900 border-b border-stone-200 pb-2 mb-4">{title}</h2>
      <div className="space-y-5">
        {Object.entries(byCategory).map(([category, catItems]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">{category}</h3>
            <ul className="space-y-3">
              {catItems.map((item) => (
                <li key={item.id} className="flex gap-3 p-2 rounded-lg bg-white/80">
                  {item.imageUrl && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-stone-100 ring-1 ring-stone-200/50">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={tierClass(item.fontSizeTier ?? "normal")}>{item.name}</span>
                      {item.isRecommended && (
                        <span className="flex-shrink-0 rounded-md bg-amber-500 text-white text-xs font-medium px-2 py-0.5">
                          Recommended
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-stone-600 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                    <p className="text-stone-800 font-semibold mt-1">${Number(item.price).toFixed(2)}</p>
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

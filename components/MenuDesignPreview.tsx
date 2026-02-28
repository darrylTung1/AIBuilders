"use client";

import Image from "next/image";
import type { MenuItem } from "@/lib/db/schema";
import type { MenuDesignSuggestion } from "@/app/api/ai/design-menu/route";

type Props = {
  items: MenuItem[];
  title?: string;
  design?: MenuDesignSuggestion;
  restaurantName?: string;
};

function tierClass(tier: string | null, design?: MenuDesignSuggestion): string {
  const base = design?.template === "elegant" ? "tracking-wide" : "";
  switch (tier) {
    case "high":
      return `${base} text-lg font-bold`;
    case "low":
      return `${base} text-sm opacity-75`;
    default:
      return `${base} text-base font-medium`;
  }
}

// Classic template - warm, traditional
function ClassicTemplate({ items, title, design }: Props) {
  const colors = design?.colorScheme || {
    primary: "#8B4513",
    secondary: "#D2691E",
    accent: "#228B22",
    background: "#FFF8DC",
    text: "#2F1810",
  };

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Specials";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderedCategories = design?.layout?.categoryOrder || Object.keys(byCategory);
  const categories = orderedCategories.filter(cat => byCategory[cat]);

  return (
    <div
      className="rounded-xl shadow-lg overflow-hidden"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      {/* Header */}
      <div className="text-center py-8 border-b-2" style={{ borderColor: colors.primary }}>
        <h1 className="text-3xl font-serif font-bold" style={{ color: colors.primary }}>
          {title || "Our Menu"}
        </h1>
        <div className="w-24 h-0.5 mx-auto mt-3" style={{ backgroundColor: colors.accent }} />
      </div>

      {/* Menu Content */}
      <div className="p-8 space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <h2
              className="text-xl font-serif font-semibold text-center mb-4 uppercase tracking-widest"
              style={{ color: colors.secondary }}
            >
              {category}
            </h2>
            <div className="space-y-4">
              {byCategory[category]?.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  {item.imageUrl && design?.layout?.showImages !== false && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2" style={{ borderColor: colors.primary }}>
                      <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="object-cover w-full h-full" unoptimized />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-serif ${tierClass(item.fontSizeTier, design)}`} style={{ color: colors.primary }}>
                        {item.name}
                        {item.isRecommended && (
                          <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: colors.accent, color: "#fff" }}>
                            Chef's Pick
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-lg" style={{ color: colors.secondary }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.description && design?.layout?.showDescriptions !== false && (
                      <p className="text-sm mt-1 italic opacity-80">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modern template - clean, minimal
function ModernTemplate({ items, title, design }: Props) {
  const colors = design?.colorScheme || {
    primary: "#102A43",
    secondary: "#486581",
    accent: "#F59E0B",
    background: "#FFFFFF",
    text: "#1E293B",
  };

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderedCategories = design?.layout?.categoryOrder || Object.keys(byCategory);
  const categories = orderedCategories.filter(cat => byCategory[cat]);
  const columns = design?.layout?.columns || 2;

  return (
    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ borderColor: colors.primary + "20" }}>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.primary }}>
          {title || "Menu"}
        </h1>
      </div>

      {/* Menu Content */}
      <div className={`p-6 ${columns === 2 ? "grid grid-cols-2 gap-8" : "space-y-6"}`}>
        {categories.map((category) => (
          <div key={category} className={columns === 2 ? "" : ""}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-4 pb-2 border-b" style={{ color: colors.accent, borderColor: colors.accent }}>
              {category}
            </h2>
            <div className="space-y-4">
              {byCategory[category]?.map((item) => (
                <div key={item.id} className="group">
                  <div className="flex items-start gap-3">
                    {item.imageUrl && design?.layout?.showImages !== false && (
                      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={item.imageUrl} alt={item.name} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className={tierClass(item.fontSizeTier, design)} style={{ color: colors.primary }}>
                            {item.name}
                          </span>
                          {item.isRecommended && (
                            <span className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.accent, color: "#fff" }}>
                              Popular
                            </span>
                          )}
                        </div>
                        <span className="font-bold whitespace-nowrap" style={{ color: colors.primary }}>
                          ${Number(item.price).toFixed(2)}
                        </span>
                      </div>
                      {item.description && design?.layout?.showDescriptions !== false && (
                        <p className="text-sm mt-0.5 opacity-70 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Elegant template - sophisticated, fine dining
function ElegantTemplate({ items, title, design }: Props) {
  const colors = design?.colorScheme || {
    primary: "#1C1C1C",
    secondary: "#C9A227",
    accent: "#8B0000",
    background: "#FFFEF7",
    text: "#1C1C1C",
  };

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Selections";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderedCategories = design?.layout?.categoryOrder || Object.keys(byCategory);
  const categories = orderedCategories.filter(cat => byCategory[cat]);

  return (
    <div className="rounded-xl shadow-xl overflow-hidden" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Decorative border */}
      <div className="p-4">
        <div className="border-2 rounded-lg" style={{ borderColor: colors.secondary }}>
          {/* Header */}
          <div className="text-center py-10">
            <div className="text-xs uppercase tracking-[0.3em] mb-2" style={{ color: colors.secondary }}>
              Fine Dining
            </div>
            <h1 className="text-4xl font-serif font-light tracking-wide" style={{ color: colors.primary }}>
              {title || "Tasting Menu"}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="w-16 h-px" style={{ backgroundColor: colors.secondary }} />
              <div className="w-2 h-2 rotate-45" style={{ backgroundColor: colors.secondary }} />
              <div className="w-16 h-px" style={{ backgroundColor: colors.secondary }} />
            </div>
          </div>

          {/* Menu Content */}
          <div className="px-10 pb-10 space-y-10">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="text-center text-sm uppercase tracking-[0.25em] mb-6" style={{ color: colors.secondary }}>
                  — {category} —
                </h2>
                <div className="space-y-6">
                  {byCategory[category]?.map((item) => (
                    <div key={item.id} className="text-center">
                      <div className="mb-1">
                        <span className={`font-serif ${tierClass(item.fontSizeTier, design)}`}>
                          {item.name}
                        </span>
                        {item.isRecommended && (
                          <span className="ml-2 text-xs align-super" style={{ color: colors.secondary }}>★</span>
                        )}
                      </div>
                      {item.description && design?.layout?.showDescriptions !== false && (
                        <p className="text-sm italic opacity-70 max-w-md mx-auto mb-1">{item.description}</p>
                      )}
                      <span className="text-sm font-medium" style={{ color: colors.secondary }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Rustic template - bold, casual
function RusticTemplate({ items, title, design }: Props) {
  const colors = design?.colorScheme || {
    primary: "#5D4037",
    secondary: "#BF360C",
    accent: "#FFC107",
    background: "#EFEBE9",
    text: "#3E2723",
  };

  const byCategory = items.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category?.trim() || "Menu";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const orderedCategories = design?.layout?.categoryOrder || Object.keys(byCategory);
  const categories = orderedCategories.filter(cat => byCategory[cat]);

  return (
    <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Header with texture */}
      <div className="relative py-8 px-6 text-center" style={{ backgroundColor: colors.primary }}>
        <h1 className="text-3xl font-bold uppercase tracking-widest text-white">
          {title || "The Menu"}
        </h1>
        <div className="absolute bottom-0 left-0 right-0 h-2" style={{ backgroundColor: colors.accent }} />
      </div>

      {/* Menu Content */}
      <div className="p-6 space-y-8">
        {categories.map((category) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-0.5" style={{ backgroundColor: colors.secondary }} />
              <h2 className="text-lg font-bold uppercase tracking-wider" style={{ color: colors.secondary }}>
                {category}
              </h2>
              <div className="flex-1 h-0.5" style={{ backgroundColor: colors.secondary }} />
            </div>
            <div className="space-y-4">
              {byCategory[category]?.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg" style={{ backgroundColor: colors.background === "#EFEBE9" ? "#fff" : colors.background }}>
                  {item.imageUrl && design?.layout?.showImages !== false && (
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden shadow-md">
                      <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="object-cover w-full h-full" unoptimized />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`font-bold uppercase ${tierClass(item.fontSizeTier, design)}`} style={{ color: colors.primary }}>
                          {item.name}
                        </span>
                        {item.isRecommended && (
                          <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: colors.accent, color: colors.primary }}>
                            House Favorite
                          </span>
                        )}
                      </div>
                      <span className="font-black text-xl" style={{ color: colors.secondary }}>
                        ${Number(item.price).toFixed(2)}
                      </span>
                    </div>
                    {item.description && design?.layout?.showDescriptions !== false && (
                      <p className="text-sm mt-1 opacity-80">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuDesignPreview({ items, title, design, restaurantName }: Props) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
        <p className="text-slate-500">No menu items to display</p>
        <p className="text-slate-400 text-sm mt-1">Import menu data to see the design preview</p>
      </div>
    );
  }

  const displayTitle = title || restaurantName || "Menu";
  const template = design?.template || "modern";

  switch (template) {
    case "classic":
      return <ClassicTemplate items={items} title={displayTitle} design={design} />;
    case "elegant":
      return <ElegantTemplate items={items} title={displayTitle} design={design} />;
    case "rustic":
      return <RusticTemplate items={items} title={displayTitle} design={design} />;
    default:
      return <ModernTemplate items={items} title={displayTitle} design={design} />;
  }
}

// Template selector thumbnails
export const TEMPLATES = [
  { id: "modern", name: "Modern", description: "Clean, minimal design" },
  { id: "classic", name: "Classic", description: "Warm, traditional feel" },
  { id: "elegant", name: "Elegant", description: "Fine dining sophistication" },
  { id: "rustic", name: "Rustic", description: "Bold, casual style" },
] as const;

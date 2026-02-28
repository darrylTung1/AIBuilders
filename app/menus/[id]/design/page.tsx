"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { MenuItemEditor } from "@/components/MenuItemEditor";
import { MenuPreview } from "@/components/MenuPreview";
import type { MenuItem, Menu, Restaurant } from "@/lib/db/schema";

export default function MenuDesignPage() {
  const params = useParams();
  const router = useRouter();
  const menuId = Number(params.id);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    if (Number.isNaN(menuId)) return;
    (async () => {
      try {
        const menuRes = await fetch(`/api/menus/${menuId}`);
        const menuData = await menuRes.json();
        if (menuData.error) throw new Error(menuData.error);
        setMenu(menuData);
        if (menuData.restaurantId) {
          const restRes = await fetch(`/api/restaurants/${menuData.restaurantId}`);
          const restData = await restRes.json();
          if (!restData.error) setRestaurant(restData);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [menuId]);

  useEffect(() => {
    if (Number.isNaN(menuId)) return;
    fetch(`/api/menus/${menuId}/items`)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []));
  }, [menuId]);

  async function updateItem(itemId: number, updates: Partial<MenuItem>) {
    const res = await fetch(`/api/menus/${menuId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updated } : i)));
  }

  async function deleteItem(itemId: number) {
    if (!confirm("Delete this item?")) return;
    const res = await fetch(`/api/menus/${menuId}/items/${itemId}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  async function exportPdf() {
    setExportingPdf(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/export-pdf`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      if (data.url) window.open(data.url, "_blank");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExportingPdf(false);
    }
  }

  function computeFontTier(popularityScore: string | null): "high" | "normal" | "low" {
    if (popularityScore == null) return "normal";
    const scores = items.map((i) => (i.popularityScore != null ? Number(i.popularityScore) : 0));
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    if (max <= min) return "normal";
    const p = Number(popularityScore);
    const pct = (p - min) / (max - min);
    if (pct >= 0.8) return "high";
    if (pct <= 0.2) return "low";
    return "normal";
  }

  if (loading) return <div className="text-stone-500">Loading...</div>;
  if (error || !menu) return <div className="text-red-600">{error ?? "Menu not found"}</div>;

  const itemsWithTier = items.map((i) => ({
    ...i,
    fontSizeTier: i.fontSizeTier ?? computeFontTier(i.popularityScore),
  }));

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="text-amber-600 hover:underline text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-semibold text-stone-800 mt-1">{menu.name} – Design</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={exportPdf}
            disabled={exportingPdf || items.length === 0}
            className="rounded-lg bg-stone-800 text-white px-4 py-2 text-sm font-medium hover:bg-stone-700 disabled:opacity-50"
          >
            {exportingPdf ? "Exporting..." : "Export PDF"}
          </button>
          <Link
            href={`/menus/${menuId}/analytics`}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-4">Edit items</h2>
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-stone-500">No items. Add items from the restaurant menu page or import SQL.</p>
            ) : (
              items.map((item) => (
                <MenuItemEditor
                  key={item.id}
                  item={item}
                  cuisineType={restaurant?.cuisineType ?? undefined}
                  theme={restaurant?.theme ?? undefined}
                  onSave={(updates) => updateItem(item.id, updates)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))
            )}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-4">Preview</h2>
          <MenuPreview items={itemsWithTier} title={menu.name} />
        </div>
      </div>
    </div>
  );
}

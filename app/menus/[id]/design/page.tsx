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
  const [enriching, setEnriching] = useState(false);

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

  async function enrichMenu() {
    if (items.length === 0) return;
    setEnriching(true);
    try {
      const res = await fetch(`/api/menus/${menuId}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descriptions: true, recommendations: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Enrich failed");
      // Refetch items to show updated descriptions and recommended badges
      const itemsRes = await fetch(`/api/menus/${menuId}/items`);
      const nextItems = await itemsRes.json();
      setItems(Array.isArray(nextItems) ? nextItems : []);
      if (data.errors?.length) {
        alert(`Enriched ${data.updated} item(s). Some errors: ${data.errors.slice(0, 3).join("; ")}`);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Enrich failed. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.");
    } finally {
      setEnriching(false);
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

  if (loading) return <div className="py-20 text-center text-stone-500 font-medium">Loading…</div>;
  if (error || !menu) return <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700">{error ?? "Menu not found"}</div>;

  const itemsWithTier = items.map((i) => ({
    ...i,
    fontSizeTier: i.fontSizeTier ?? computeFontTier(i.popularityScore),
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 font-medium text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">{menu.name}</h1>
          <p className="text-stone-500 text-sm mt-0.5">Design</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={enrichMenu}
            disabled={enriching || items.length === 0}
            className="rounded-xl bg-amber-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {enriching ? "AI processing…" : "AI-enrich menu"}
          </button>
          <button
            type="button"
            onClick={exportPdf}
            disabled={exportingPdf || items.length === 0}
            className="rounded-xl bg-stone-800 text-white px-5 py-2.5 text-sm font-semibold hover:bg-stone-700 disabled:opacity-50 transition-colors"
          >
            {exportingPdf ? "Exporting…" : "Export PDF"}
          </button>
          <Link
            href={`/menus/${menuId}/analytics`}
            className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
            <h2 className="font-semibold text-stone-800">Edit items</h2>
            <p className="text-stone-500 text-sm mt-0.5">Update names, descriptions, prices, photos, and recommended badges.</p>
          </div>
          <div className="p-5 space-y-4">
            {items.length === 0 ? (
              <p className="text-stone-500 py-6 text-center text-sm">No items yet. Go to the restaurant page and import from SQL or create a blank menu.</p>
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
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
            <h2 className="font-semibold text-stone-800">Preview</h2>
            <p className="text-stone-500 text-sm mt-0.5">How your menu will look.</p>
          </div>
          <div className="p-5">
            <MenuPreview items={itemsWithTier} title={menu.name} />
          </div>
        </div>
      </div>
    </div>
  );
}

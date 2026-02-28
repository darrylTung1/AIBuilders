"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MenuItemEditor } from "@/components/MenuItemEditor";
import { MenuDesignPreview, TEMPLATES } from "@/components/MenuDesignPreview";
import type { MenuItem, Menu, Restaurant } from "@/lib/db/schema";
import type { MenuDesignSuggestion } from "@/app/api/ai/design-menu/route";
import { ArrowLeft, Sparkles, FileText, TrendingUp, Wand2, Check, Loader2 } from "lucide-react";

export default function MenuDesignPage() {
  const params = useParams();
  const menuId = Number(params.id);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [generatingDesign, setGeneratingDesign] = useState(false);
  const [design, setDesign] = useState<MenuDesignSuggestion | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");

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

  async function generateAIDesign() {
    setGeneratingDesign(true);
    try {
      const categories = [...new Set(items.map(i => i.category || "Other"))];
      const res = await fetch("/api/ai/design-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurant?.name,
          cuisineType: restaurant?.cuisineType,
          theme: restaurant?.theme,
          categories,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDesign(data);
      setSelectedTemplate(data.template);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate design");
    } finally {
      setGeneratingDesign(false);
    }
  }

  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    if (design) {
      setDesign({ ...design, template: templateId as "classic" | "modern" | "elegant" | "rustic" });
    } else {
      setDesign({
        template: templateId as "classic" | "modern" | "elegant" | "rustic",
        colorScheme: { primary: "#102A43", secondary: "#486581", accent: "#F59E0B", background: "#F8FAFC", text: "#1E293B" },
        typography: { heading: "Inter", body: "Inter", style: "Clean" },
        layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: [] },
        reasoning: "Manual selection",
      });
    }
  }

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
      const res = await fetch(`/api/menus/${menuId}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate, design }),
      });
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-500 font-medium">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error || !menu) {
    return (
      <DashboardLayout>
        <div className="card border-rose-200 bg-rose-50 p-6 text-rose-700">{error ?? "Menu not found"}</div>
      </DashboardLayout>
    );
  }

  const itemsWithTier = items.map((i) => ({
    ...i,
    fontSizeTier: i.fontSizeTier ?? computeFontTier(i.popularityScore),
  }));

  return (
    <DashboardLayout restaurantName={restaurant?.name}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-navy-900">{menu.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Design & Edit</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={generateAIDesign}
              disabled={generatingDesign || items.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-2.5 text-sm font-semibold hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all"
            >
              {generatingDesign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {generatingDesign ? "Designing..." : "AI Design Menu"}
            </button>
            <button
              type="button"
              onClick={enrichMenu}
              disabled={enriching || items.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gold-500 text-navy-900 px-5 py-2.5 text-sm font-semibold hover:bg-gold-400 disabled:opacity-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {enriching ? "Processing..." : "AI Enrich"}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exportingPdf || items.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-navy-800 disabled:opacity-50 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </button>
            <Link
              href={`/menus/${menuId}/analytics`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Link>
          </div>
        </div>

        {/* AI Design Recommendation */}
        {design?.reasoning && (
          <div className="card p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">AI Design Recommendation</h3>
                <p className="text-sm text-indigo-700 mt-1">{design.reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Template Selection */}
        <div className="card p-4">
          <h3 className="font-semibold text-navy-900 mb-3">Menu Template</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  selectedTemplate === template.id
                    ? "border-gold-500 bg-gold-50"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="font-medium text-navy-900">{template.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Edit Items Panel */}
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-navy-900">Edit Items</h2>
              <p className="text-slate-500 text-sm mt-0.5">{items.length} items</p>
            </div>
            <div className="p-6 space-y-4 max-h-[700px] overflow-y-auto">
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-500 text-sm">No items yet.</p>
                  <p className="text-slate-400 text-xs mt-1">Import menu data from the dashboard.</p>
                </div>
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

          {/* Preview Panel */}
          <div className="xl:col-span-3 card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="font-semibold text-navy-900">Menu Preview</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} template
              </p>
            </div>
            <div className="p-6 bg-slate-100 min-h-[500px]">
              <div className="max-w-2xl mx-auto">
                <MenuDesignPreview
                  items={itemsWithTier}
                  title={menu.name}
                  design={design || { template: selectedTemplate as "modern", colorScheme: { primary: "#102A43", secondary: "#486581", accent: "#F59E0B", background: "#F8FAFC", text: "#1E293B" }, typography: { heading: "Inter", body: "Inter", style: "Clean" }, layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: [] }, reasoning: "" }}
                  restaurantName={restaurant?.name}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

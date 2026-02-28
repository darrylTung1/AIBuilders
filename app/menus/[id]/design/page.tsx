"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MenuItemEditor } from "@/components/MenuItemEditor";
import { MenuDesignPreview, TEMPLATES } from "@/components/MenuDesignPreview";
import type { MenuItem, Menu, Restaurant } from "@/lib/db/schema";
import type { MenuDesignSuggestion } from "@/app/api/ai/design-menu/route";
import { ArrowLeft, FileText, TrendingUp, Wand2, Check, Loader2, Star, ChefHat, ImageIcon, X, Download, AlertCircle } from "lucide-react";

type StatusMessage = {
  type: "success" | "error" | "info";
  text: string;
} | null;

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
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);

  // Auto-clear status after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

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
    setStatusMessage({ type: "info", text: "Analyzing menu and selecting best design..." });
    try {
      const itemsData = items.map(item => ({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        popularityScore: item.popularityScore,
      }));

      const res = await fetch("/api/ai/design-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantName: restaurant?.name,
          cuisineType: restaurant?.cuisineType,
          theme: restaurant?.theme,
          items: itemsData,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDesign(data);
      setSelectedTemplate(data.template);
      setStatusMessage({ 
        type: "success", 
        text: `Design applied: ${data.template} template with ${data.chefRecommendations?.length || 0} chef picks` 
      });
    } catch (e) {
      setStatusMessage({ type: "error", text: e instanceof Error ? e.message : "Failed to generate design" });
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
        reasoning: "",
      });
    }
    setStatusMessage({ type: "success", text: `Switched to ${templateId} template` });
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
    setStatusMessage({ type: "info", text: "Generating PDF..." });
    try {
      const res = await fetch(`/api/menus/${menuId}/export-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate, design }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      if (data.url) {
        // Download the PDF
        const link = document.createElement("a");
        link.href = data.url;
        link.download = `${menu?.name || "menu"}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setStatusMessage({ type: "success", text: "PDF downloaded successfully!" });
      }
    } catch (e) {
      setStatusMessage({ type: "error", text: e instanceof Error ? e.message : "Export failed" });
    } finally {
      setExportingPdf(false);
    }
  }

  async function generateImages() {
    if (items.length === 0) return;
    
    const itemsWithoutImages = items.filter(i => !i.imageUrl);
    if (itemsWithoutImages.length === 0) {
      setStatusMessage({ type: "info", text: "All items already have images" });
      return;
    }
    
    setEnriching(true);
    setStatusMessage({ type: "info", text: `Generating images for ${itemsWithoutImages.length} item(s)... This may take a minute.` });
    
    try {
      const res = await fetch(`/api/menus/${menuId}/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: true, recommendations: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Image generation failed");
      
      // Refresh items
      const itemsRes = await fetch(`/api/menus/${menuId}/items`);
      const nextItems = await itemsRes.json();
      setItems(Array.isArray(nextItems) ? nextItems : []);
      
      if (data.errors?.length) {
        setStatusMessage({ type: "error", text: `Generated ${data.updated} image(s). Errors: ${data.errors[0]}` });
      } else {
        setStatusMessage({ type: "success", text: `Generated ${data.updated} food image(s) with WaveSpeed AI` });
      }
    } catch (e) {
      setStatusMessage({ type: "error", text: e instanceof Error ? e.message : "Image generation failed. Check WAVESPEED_API_KEY." });
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

  function getItemWithEnhancements(item: MenuItem) {
    return {
      ...item,
      fontSizeTier: item.fontSizeTier ?? computeFontTier(item.popularityScore),
      isRecommended: item.isRecommended || design?.chefRecommendations?.includes(item.name) || false,
    };
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

  const itemsWithTier = items.map(getItemWithEnhancements);
  const itemsWithoutImages = items.filter(i => !i.imageUrl).length;

  return (
    <DashboardLayout restaurantName={restaurant?.name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-navy-900">{menu.name}</h1>
            <p className="text-slate-500 text-sm mt-0.5">{items.length} items • {selectedTemplate} template</p>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className={`flex items-center gap-3 p-4 rounded-lg ${
            statusMessage.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" :
            statusMessage.type === "error" ? "bg-rose-50 border border-rose-200 text-rose-800" :
            "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
            {statusMessage.type === "success" && <Check className="w-5 h-5 flex-shrink-0" />}
            {statusMessage.type === "error" && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {statusMessage.type === "info" && <Loader2 className="w-5 h-5 flex-shrink-0 animate-spin" />}
            <span className="flex-1 text-sm font-medium">{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="p-1 hover:bg-black/5 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Auto Design Card */}
          <div className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Auto Design</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Picks template & colors based on your cuisine type
                </p>
              </div>
            </div>
            <button
              onClick={generateAIDesign}
              disabled={generatingDesign || items.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-500 text-white px-4 py-2.5 text-sm font-semibold hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              {generatingDesign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {generatingDesign ? "Analyzing..." : "Apply Best Design"}
            </button>
          </div>

          {/* Generate Images Card */}
          <div className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Food Photos</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {itemsWithoutImages > 0 
                    ? `Generate AI photos for ${itemsWithoutImages} item(s)` 
                    : "All items have images"}
                </p>
              </div>
            </div>
            <button
              onClick={generateImages}
              disabled={enriching || items.length === 0 || itemsWithoutImages === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gold-500 text-navy-900 px-4 py-2.5 text-sm font-semibold hover:bg-gold-400 disabled:opacity-50 transition-colors"
            >
              {enriching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {enriching ? "Generating..." : itemsWithoutImages > 0 ? `Generate ${itemsWithoutImages} Photos` : "All Done"}
            </button>
          </div>

          {/* Export PDF Card */}
          <div className="card p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Export Menu</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download as PDF with current template
                </p>
              </div>
            </div>
            <button
              onClick={exportPdf}
              disabled={exportingPdf || items.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 text-white px-4 py-2.5 text-sm font-semibold hover:bg-navy-800 disabled:opacity-50 transition-colors"
            >
              {exportingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {exportingPdf ? "Creating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Design Insights (show after auto-design) */}
        {design?.chefRecommendations && design.chefRecommendations.length > 0 && (
          <div className="card p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <ChefHat className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-amber-900 text-sm">Chef&apos;s Picks (by popularity)</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {design.chefRecommendations.map((item, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-sm text-amber-800 border border-amber-200">
                  <Star className="w-3 h-3 text-amber-500" />
                  {item}
                </span>
              ))}
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
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Edit Items Panel */}
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-navy-900">Edit Items</h2>
                <p className="text-slate-500 text-sm mt-0.5">{items.length} items</p>
              </div>
              <Link
                href={`/menus/${menuId}/analytics`}
                className="inline-flex items-center gap-1 text-sm text-navy-600 hover:text-navy-800"
              >
                <TrendingUp className="w-4 h-4" />
                Analytics
              </Link>
            </div>
            <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
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
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-navy-900">Menu Preview</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} template
                </p>
              </div>
              {design?.colorScheme && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-400 mr-2">Colors:</span>
                  {Object.entries(design.colorScheme).slice(0, 3).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-5 h-5 rounded-full border border-slate-200"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-100 min-h-[500px]">
              <div className="max-w-2xl mx-auto">
                <MenuDesignPreview
                  items={itemsWithTier}
                  title={menu.name}
                  design={design || {
                    template: selectedTemplate as "modern",
                    colorScheme: { primary: "#102A43", secondary: "#486581", accent: "#F59E0B", background: "#F8FAFC", text: "#1E293B" },
                    typography: { heading: "Inter", body: "Inter", style: "Clean" },
                    layout: { columns: 2, showImages: true, showDescriptions: true, categoryOrder: [] },
                    reasoning: "",
                  }}
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

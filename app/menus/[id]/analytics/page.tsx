"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import type { ItemAnalytics } from "@/lib/analytics/profitability";
import { ArrowLeft, Palette, TrendingUp, Star } from "lucide-react";

export default function MenuAnalyticsPage() {
  const params = useParams();
  const menuId = Number(params.id);
  const [items, setItems] = useState<ItemAnalytics[]>([]);
  const [menuName, setMenuName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(menuId)) return;
    Promise.all([
      fetch(`/api/menus/${menuId}`).then((r) => r.json()),
      fetch(`/api/menus/${menuId}/analytics`).then((r) => r.json()),
    ])
      .then(([menuData, analyticsData]) => {
        if (menuData.error) throw new Error(menuData.error);
        setMenuName(menuData.name ?? "");
        setItems(Array.isArray(analyticsData?.items) ? analyticsData.items : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [menuId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 text-center text-slate-500 font-medium">Loading...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="card border-rose-200 bg-rose-50 p-6 text-rose-700">Error: {error}</div>
      </DashboardLayout>
    );
  }

  // Calculate summary stats
  const avgMargin = items.length > 0
    ? items.reduce((acc, item) => acc + (item.marginPercent ?? 0), 0) / items.length
    : 0;
  const avgPopularity = items.length > 0
    ? items.reduce((acc, item) => acc + (item.popularityScore ?? 0), 0) / items.length
    : 0;
  const recommendedCount = items.filter(item => item.isRecommended).length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-navy-900">{menuName}</h1>
            <p className="text-slate-500 text-sm mt-0.5">Analytics & Insights</p>
          </div>
          <Link
            href={`/menus/${menuId}/design`}
            className="inline-flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 text-navy-900 text-sm font-semibold hover:bg-gold-400 transition-colors"
          >
            <Palette className="w-4 h-4" />
            Back to Design
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Avg. Margin</p>
                <p className="text-xl font-bold text-navy-900">{avgMargin.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-slate-500 text-sm">Avg. Popularity</p>
                <p className="text-xl font-bold text-navy-900">{avgPopularity.toFixed(0)}</p>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <span className="text-navy-600 font-bold">{recommendedCount}</span>
              </div>
              <div>
                <p className="text-slate-500 text-sm">Recommended Items</p>
                <p className="text-xl font-bold text-navy-900">{recommendedCount} of {items.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-navy-900">Item Profitability & Popularity</h2>
            <p className="text-slate-500 text-sm mt-0.5">Margin and popularity metrics by menu item.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-navy-900">Item</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-navy-900">Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-navy-900">Cost</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-navy-900">Margin</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-navy-900">Margin %</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-navy-900">Popularity</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-navy-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-navy-900">{row.name}</td>
                    <td className="px-6 py-4 text-right text-slate-700">${row.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{row.cost != null ? `$${row.cost.toFixed(2)}` : "–"}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{row.margin != null ? `$${row.margin.toFixed(2)}` : "–"}</td>
                    <td className="px-6 py-4 text-right">
                      {row.marginPercent != null ? (
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          row.marginPercent >= 60 ? "bg-emerald-100 text-emerald-700" :
                          row.marginPercent >= 40 ? "bg-gold-100 text-gold-700" :
                          "bg-rose-100 text-rose-700"
                        }`}>
                          {row.marginPercent.toFixed(1)}%
                        </span>
                      ) : "–"}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">{row.popularityScore != null ? String(row.popularityScore) : "–"}</td>
                    <td className="px-6 py-4 text-center">
                      {row.isRecommended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 text-navy-900 text-xs font-semibold px-3 py-1">
                          <Star className="w-3 h-3" />
                          Recommended
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

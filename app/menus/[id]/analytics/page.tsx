"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ItemAnalytics } from "@/lib/analytics/profitability";

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

  if (loading) return <div className="py-20 text-center text-stone-500 font-medium">Loading…</div>;
  if (error) return <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-700">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 font-medium text-sm">← Dashboard</Link>
          <h1 className="text-2xl font-bold text-stone-900 mt-1">{menuName}</h1>
          <p className="text-stone-500 text-sm mt-0.5">Analytics</p>
        </div>
        <Link
          href={`/menus/${menuId}/design`}
          className="inline-flex items-center rounded-xl bg-amber-500 px-5 py-2.5 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          Back to Design
        </Link>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
          <h2 className="font-semibold text-stone-800">Item profitability & popularity</h2>
          <p className="text-stone-500 text-sm mt-0.5">Margin and popularity by menu item.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-5 py-3 text-left text-sm font-semibold text-stone-700">Item</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-stone-700">Price</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-stone-700">Cost</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-stone-700">Margin</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-stone-700">Margin %</th>
                <th className="px-5 py-3 text-right text-sm font-semibold text-stone-700">Popularity</th>
                <th className="px-5 py-3 text-center text-sm font-semibold text-stone-700">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-stone-800">{row.name}</td>
                  <td className="px-5 py-3 text-right text-stone-700">${row.price.toFixed(2)}</td>
                  <td className="px-5 py-3 text-right text-stone-600">{row.cost != null ? `$${row.cost.toFixed(2)}` : "–"}</td>
                  <td className="px-5 py-3 text-right text-stone-600">{row.margin != null ? `$${row.margin.toFixed(2)}` : "–"}</td>
                  <td className="px-5 py-3 text-right text-stone-600">{row.marginPercent != null ? `${row.marginPercent.toFixed(1)}%` : "–"}</td>
                  <td className="px-5 py-3 text-right text-stone-600">{row.popularityScore != null ? String(row.popularityScore) : "–"}</td>
                  <td className="px-5 py-3 text-center">
                    {row.isRecommended ? (
                      <span className="inline-flex rounded-lg bg-amber-500 text-white text-xs font-medium px-2 py-1">Yes</span>
                    ) : (
                      "–"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

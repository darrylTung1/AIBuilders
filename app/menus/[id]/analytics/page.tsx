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

  if (loading) return <div className="text-stone-500">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-amber-600 hover:underline text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-semibold text-stone-800 mt-1">{menuName} – Analytics</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-stone-200">
          <thead>
            <tr className="bg-stone-100">
              <th className="border border-stone-200 px-4 py-2 text-left text-sm font-medium text-stone-700">Item</th>
              <th className="border border-stone-200 px-4 py-2 text-right text-sm font-medium text-stone-700">Price</th>
              <th className="border border-stone-200 px-4 py-2 text-right text-sm font-medium text-stone-700">Cost</th>
              <th className="border border-stone-200 px-4 py-2 text-right text-sm font-medium text-stone-700">Margin</th>
              <th className="border border-stone-200 px-4 py-2 text-right text-sm font-medium text-stone-700">Margin %</th>
              <th className="border border-stone-200 px-4 py-2 text-right text-sm font-medium text-stone-700">Popularity</th>
              <th className="border border-stone-200 px-4 py-2 text-center text-sm font-medium text-stone-700">Recommended</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="hover:bg-stone-50">
                <td className="border border-stone-200 px-4 py-2 text-stone-800">{row.name}</td>
                <td className="border border-stone-200 px-4 py-2 text-right">${row.price.toFixed(2)}</td>
                <td className="border border-stone-200 px-4 py-2 text-right">
                  {row.cost != null ? `$${row.cost.toFixed(2)}` : "–"}
                </td>
                <td className="border border-stone-200 px-4 py-2 text-right">
                  {row.margin != null ? `$${row.margin.toFixed(2)}` : "–"}
                </td>
                <td className="border border-stone-200 px-4 py-2 text-right">
                  {row.marginPercent != null ? `${row.marginPercent.toFixed(1)}%` : "–"}
                </td>
                <td className="border border-stone-200 px-4 py-2 text-right">
                  {row.popularityScore != null ? String(row.popularityScore) : "–"}
                </td>
                <td className="border border-stone-200 px-4 py-2 text-center">
                  {row.isRecommended ? (
                    <span className="rounded bg-amber-500 text-white text-xs px-2 py-0.5">Yes</span>
                  ) : (
                    "–"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href={`/menus/${menuId}/design`}
        className="inline-block rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-medium hover:bg-amber-700"
      >
        Back to Design
      </Link>
    </div>
  );
}

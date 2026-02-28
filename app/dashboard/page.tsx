"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Restaurant = { id: number; name: string; cuisineType: string | null; theme: string | null };
type Menu = { id: number; restaurantId: number; name: string; version: number };

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/restaurants").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/menus").then(async (r) => ({ ok: r.ok, data: await r.json() })),
    ])
      .then(([restRes, menuRes]) => {
        if (!restRes.ok && restRes.data?.error) setError(restRes.data.error);
        else setRestaurants(Array.isArray(restRes.data) ? restRes.data : []);
        if (menuRes.ok && Array.isArray(menuRes.data)) setMenus(menuRes.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stone-500 font-medium">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">Could not load dashboard</p>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <p className="text-stone-600 text-xs mt-3">
            After fixing the issue, refresh the page. Then use &quot;Add Restaurant&quot; to create your first restaurant.
          </p>
        </div>
        <Link
          href="/dashboard/restaurants/new"
          className="inline-flex items-center rounded-xl bg-amber-500 px-6 py-3 text-white font-semibold hover:bg-amber-600 transition-colors"
        >
          Add Restaurant
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">Manage restaurants and menus</p>
        </div>
        <Link
          href="/dashboard/restaurants/new"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-2.5 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm"
        >
          Add Restaurant
        </Link>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
          <h2 className="font-semibold text-stone-800">Restaurants</h2>
          <p className="text-stone-500 text-sm mt-0.5">Create a restaurant to add menus and import items from SQL.</p>
        </div>
        <div className="p-5">
          {restaurants.length === 0 ? (
            <p className="text-stone-500 py-4">No restaurants yet. Add one to get started.</p>
          ) : (
            <ul className="space-y-2">
              {restaurants.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/dashboard/restaurants/${r.id}`}
                    className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-stone-900 group-hover:text-amber-600 transition-colors">{r.name}</span>
                      {r.cuisineType && (
                        <span className="text-stone-500 text-sm ml-2">({r.cuisineType})</span>
                      )}
                    </div>
                    <span className="text-amber-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      View menus →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
          <h2 className="font-semibold text-stone-800">Recent menus</h2>
          <p className="text-stone-500 text-sm mt-0.5">Open a menu to design or view analytics.</p>
        </div>
        <div className="p-5">
          {menus.length === 0 ? (
            <p className="text-stone-500 py-4">No menus yet. Create a restaurant and import or create a menu.</p>
          ) : (
            <ul className="space-y-2">
              {menus.slice(0, 10).map((m) => (
                <li key={m.id}>
                  <div className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-stone-50 transition-colors">
                    <span className="font-medium text-stone-800">{m.name}</span>
                    <div className="flex gap-3">
                      <Link
                        href={`/menus/${m.id}/design`}
                        className="text-amber-600 hover:text-amber-700 text-sm font-medium"
                      >
                        Design
                      </Link>
                      <Link
                        href={`/menus/${m.id}/analytics`}
                        className="text-stone-500 hover:text-stone-700 text-sm font-medium"
                      >
                        Analytics
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

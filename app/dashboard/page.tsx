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
    Promise.all([fetch("/api/restaurants").then((r) => r.json()), fetch("/api/menus").then((r) => r.json())])
      .then(([restList, menuList]) => {
        setRestaurants(Array.isArray(restList) ? restList : []);
        setMenus(Array.isArray(menuList) ? menuList : []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-stone-500">Loading...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-stone-800">Dashboard</h1>
        <Link
          href="/dashboard/restaurants/new"
          className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-medium hover:bg-amber-700"
        >
          Add Restaurant
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-stone-700 mb-4">Restaurants</h2>
        {restaurants.length === 0 ? (
          <p className="text-stone-500">No restaurants yet. Add one to get started.</p>
        ) : (
          <ul className="space-y-2">
            {restaurants.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <span className="font-medium text-stone-800">{r.name}</span>
                  {r.cuisineType && <span className="text-stone-500 text-sm ml-2">({r.cuisineType})</span>}
                </div>
                <Link href={`/dashboard/restaurants/${r.id}`} className="text-amber-600 hover:underline text-sm">
                  View menus
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-stone-700 mb-4">Recent Menus</h2>
        {menus.length === 0 ? (
          <p className="text-stone-500">No menus yet. Create a restaurant and import or create a menu.</p>
        ) : (
          <ul className="space-y-2">
            {menus.slice(0, 10).map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2 border-b border-stone-100">
                <span className="text-stone-800">{m.name}</span>
                <div className="flex gap-2">
                  <Link href={`/menus/${m.id}/design`} className="text-amber-600 hover:underline text-sm">
                    Design
                  </Link>
                  <Link href={`/menus/${m.id}/analytics`} className="text-stone-500 hover:underline text-sm">
                    Analytics
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

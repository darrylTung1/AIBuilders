"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { SqlImportCard } from "@/components/SqlImportCard";

type Restaurant = { id: number; name: string; cuisineType: string | null; theme: string | null };
type Menu = { id: number; restaurantId: number; name: string };

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuName, setMenuName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    fetch(`/api/restaurants/${id}`)
      .then((r) => r.json())
      .then((data) => (data.error ? null : setRestaurant(data)))
      .catch(() => setRestaurant(null));
  }, [id]);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    fetch(`/api/menus?restaurantId=${id}`)
      .then((r) => r.json())
      .then((data) => setMenus(Array.isArray(data) ? data : []));
  }, [id]);

  async function createMenu(e: React.FormEvent) {
    e.preventDefault();
    if (!menuName.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId: id, name: menuName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/menus/${data.id}/design`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  }

  if (!restaurant) return <div className="text-stone-500 py-8">Loading…</div>;
  if (!restaurant.id) return <div className="text-red-600 py-8">Restaurant not found.</div>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 mt-2">{restaurant.name}</h1>
        {(restaurant.cuisineType || restaurant.theme) && (
          <p className="text-stone-500 text-sm mt-1">
            {[restaurant.cuisineType, restaurant.theme].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>

      {/* SQL Import - prominent card */}
      <section>
        <SqlImportCard
          restaurantId={id}
          onSuccess={(menuId) => router.push(`/menus/${menuId}/design`)}
          onError={setError}
        />
        {error && (
          <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-red-700 text-sm">
            {error}
          </div>
        )}
      </section>

      {/* Create menu manually + list */}
      <section className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
          <h2 className="font-semibold text-stone-800">Menus</h2>
          <p className="text-stone-500 text-sm mt-0.5">Create a blank menu or open an existing one to edit.</p>
        </div>
        <div className="p-5 space-y-5">
          <form onSubmit={createMenu} className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
              placeholder="New menu name"
              className="flex-1 min-w-[180px] rounded-lg border border-stone-300 px-3 py-2 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-stone-800 px-4 py-2 text-white text-sm font-medium hover:bg-stone-700 transition-colors"
            >
              Create menu
            </button>
          </form>

          {menus.length > 0 && (
            <ul className="space-y-2">
              {menus.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between py-3 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <span className="font-medium text-stone-800">{m.name}</span>
                  <div className="flex gap-2">
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
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

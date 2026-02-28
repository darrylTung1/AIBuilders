"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Restaurant = { id: number; name: string; cuisineType: string | null; theme: string | null };
type Menu = { id: number; restaurantId: number; name: string };

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuName, setMenuName] = useState("");
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) return;
    fetch(`/api/restaurants/${id}`)
      .then((r) => r.json())
      .then((data) => (data.error ? null : setRestaurant(data)))
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));
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

  async function handleSqlImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    try {
      const sql = await file.text();
      const res = await fetch("/api/menus/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, restaurantId: id, menuName: file.name.replace(/\.sql$/i, "") || "Imported Menu" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      router.push(`/menus/${data.menu.id}/design`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  }

  if (loading || !restaurant) return <div className="text-stone-500">Loading...</div>;
  if (!restaurant.id) return <div className="text-red-600">Restaurant not found.</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard" className="text-amber-600 hover:underline text-sm">← Dashboard</Link>
        <h1 className="text-2xl font-semibold text-stone-800 mt-2">{restaurant.name}</h1>
        {(restaurant.cuisineType || restaurant.theme) && (
          <p className="text-stone-500 text-sm mt-1">{[restaurant.cuisineType, restaurant.theme].filter(Boolean).join(" · ")}</p>
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-stone-700 mb-4">Menus</h2>
        <ul className="space-y-2 mb-6">
          {menus.map((m) => (
            <li key={m.id} className="flex items-center justify-between py-2 border-b border-stone-100">
              <span className="text-stone-800">{m.name}</span>
              <div className="flex gap-2">
                <Link href={`/menus/${m.id}/design`} className="text-amber-600 hover:underline text-sm">Design</Link>
                <Link href={`/menus/${m.id}/analytics`} className="text-stone-500 hover:underline text-sm">Analytics</Link>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={createMenu} className="flex gap-2 mb-4">
          <input
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            placeholder="New menu name"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-amber-600 px-4 py-2 text-white text-sm font-medium hover:bg-amber-700">
            Create menu
          </button>
        </form>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
            {importing ? "Importing..." : "Import SQL file"}
            <input type="file" accept=".sql" onChange={handleSqlImport} disabled={importing} className="hidden" />
          </label>
        </div>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ImportInterface } from "@/components/ImportInterface";
import { EditMenuModal } from "@/components/EditMenuModal";
import { ArrowLeft, Plus, Palette, TrendingUp, Upload, Edit3, Trash2 } from "lucide-react";

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
  const [showImport, setShowImport] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

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

  async function handleImport(sql: string, fileName?: string) {
    const res = await fetch("/api/menus/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sql: sql.trim(),
        restaurantId: id,
        menuName: fileName || "Imported Menu",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.menu?.id) {
        router.push(`/menus/${data.menu.id}/design`);
      }
    } else {
      const err = await res.json();
      throw new Error(err.error || "Import failed");
    }
  }

  async function updateMenu(menuId: number, name: string) {
    const res = await fetch(`/api/menus/${menuId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update menu");
    }
    
    const updatedMenu = await res.json();
    setMenus(prev => prev.map(m => m.id === menuId ? updatedMenu : m));
  }

  async function deleteMenu(menuId: number) {
    const res = await fetch(`/api/menus/${menuId}`, {
      method: "DELETE",
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete menu");
    }
    
    setMenus(prev => prev.filter(m => m.id !== menuId));
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-slate-500 py-8">Loading...</div>
      </DashboardLayout>
    );
  }

  if (!restaurant.id) {
    return (
      <DashboardLayout>
        <div className="card border-rose-200 bg-rose-50 p-6 text-rose-700">Restaurant not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout restaurantName={restaurant.name}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 text-sm font-medium mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">{restaurant.name}</h1>
          {(restaurant.cuisineType || restaurant.theme) && (
            <p className="text-slate-500 text-sm mt-1">
              {[restaurant.cuisineType, restaurant.theme].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {/* Import Section */}
        {showImport ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900">Import Menu</h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
            <ImportInterface
              onImport={handleImport}
              onCancel={() => setShowImport(false)}
            />
          </section>
        ) : (
          <section className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-navy-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-navy-900">Import Menu from SQL</h3>
                <p className="text-slate-500 text-sm">Upload a SQL file or paste your menu data</p>
              </div>
              <button
                onClick={() => setShowImport(true)}
                className="px-4 py-2 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                Import
              </button>
            </div>
          </section>
        )}

        {error && (
          <div className="card border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm">
            {error}
          </div>
        )}

        {/* Create Menu Section */}
        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-navy-900">Menus</h2>
            <p className="text-slate-500 text-sm mt-0.5">Create a blank menu or open an existing one to edit.</p>
          </div>
          <div className="p-6 space-y-6">
            <form onSubmit={createMenu} className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={menuName}
                onChange={(e) => setMenuName(e.target.value)}
                placeholder="New menu name"
                className="flex-1 min-w-[180px] rounded-lg border border-slate-300 px-4 py-2.5 text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-white text-sm font-medium hover:bg-navy-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create menu
              </button>
            </form>

            {menus.length > 0 && (
              <ul className="space-y-2">
                {menus.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-medium text-navy-900">{m.name}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingMenu(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>
                      <Link
                        href={`/menus/${m.id}/design`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-100 text-gold-700 rounded-lg text-sm font-medium hover:bg-gold-200 transition-colors"
                      >
                        <Palette className="w-4 h-4" />
                        Design
                      </Link>
                      <Link
                        href={`/menus/${m.id}/analytics`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-100 text-navy-700 rounded-lg text-sm font-medium hover:bg-navy-200 transition-colors"
                      >
                        <TrendingUp className="w-4 h-4" />
                        Analytics
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Edit Menu Modal */}
        {editingMenu && (
          <EditMenuModal
            menu={editingMenu}
            onSave={updateMenu}
            onDelete={deleteMenu}
            onClose={() => setEditingMenu(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

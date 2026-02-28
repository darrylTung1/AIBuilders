"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiCards } from "@/components/KpiCards";
import { MenuItemCard, type MenuItem } from "@/components/MenuItemCard";
import { ProfitabilityMatrix } from "@/components/ProfitabilityMatrix";
import { ImportInterface } from "@/components/ImportInterface";
import { Plus, Upload, FileText, Store } from "lucide-react";

type Restaurant = { id: number; name: string; cuisineType: string | null; theme: string | null };
type Menu = { id: number; restaurantId: number; name: string; version: number };
type MenuItemFromApi = {
  id: number;
  menuId: number;
  name: string;
  description: string | null;
  price: string;
  popularityScore: string | null;
  category: string | null;
  profitMargin?: number;
  imageUrl?: string;
};

export default function DashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/restaurants").then(async (r) => ({ ok: r.ok, data: await r.json() })),
      fetch("/api/menus").then(async (r) => ({ ok: r.ok, data: await r.json() })),
    ])
      .then(([restRes, menuRes]) => {
        if (!restRes.ok && restRes.data?.error) setError(restRes.data.error);
        else {
          const rests = Array.isArray(restRes.data) ? restRes.data : [];
          setRestaurants(rests);
          if (rests.length > 0) setSelectedRestaurant(rests[0]);
        }
        if (menuRes.ok && Array.isArray(menuRes.data)) {
          setMenus(menuRes.data);
          // Fetch items for first menu
          if (menuRes.data.length > 0) {
            fetchMenuItems(menuRes.data[0].id);
          }
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fetchMenuItems = async (menuId: number) => {
    try {
      const res = await fetch(`/api/menus/${menuId}/items`);
      if (res.ok) {
        const data = await res.json();
        // Convert API data to MenuItem format
        const items: MenuItem[] = data.map((item: MenuItemFromApi) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: parseFloat(item.price),
          category: item.category || "Uncategorized",
          popularityScore: item.popularityScore ? parseInt(item.popularityScore) : 50,
          profitMargin: item.profitMargin || Math.floor(Math.random() * 60) + 20,
          imageUrl: item.imageUrl,
        }));
        setMenuItems(items);
      }
    } catch (e) {
      console.error("Failed to fetch menu items:", e);
    }
  };

  const handleImport = async (sql: string, fileName?: string) => {
    if (!selectedRestaurant) return;
    
    // Create a menu first if none exists
    let menuId = menus[0]?.id;
    if (!menuId) {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id,
          name: "Imported Menu",
        }),
      });
      const newMenu = await res.json();
      menuId = newMenu.id;
      setMenus([...menus, newMenu]);
    }

    // Import the SQL
    const res = await fetch("/api/menus/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sql: sql.trim(),
        restaurantId: selectedRestaurant.id,
        menuName: fileName || "Imported Menu",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.menu?.id) {
        fetchMenuItems(data.menu.id);
        setShowImport(false);
      }
    } else {
      const err = await res.json();
      throw new Error(err.error || "Import failed");
    }
  };

  const kpiData = {
    totalItems: menuItems.length,
    avgProfitMargin: menuItems.length > 0
      ? menuItems.reduce((acc, item) => acc + item.profitMargin, 0) / menuItems.length
      : 0,
    topPerformers: menuItems.filter((item) => item.profitMargin >= 60 && item.popularityScore >= 70).length,
    itemsChange: menuItems.length > 0 ? 12 : 0,
    marginChange: 5.2,
    topChange: 8,
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-slate-500 font-medium">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="card border-rose-200 bg-rose-50 p-6">
            <p className="font-semibold text-rose-800">Could not load dashboard</p>
            <p className="text-rose-700 text-sm mt-1">{error}</p>
            <p className="text-slate-600 text-xs mt-3">
              After fixing the issue, refresh the page. Then use &quot;Add Restaurant&quot; to create your first restaurant.
            </p>
          </div>
          <Link
            href="/dashboard/restaurants/new"
            className="inline-flex items-center rounded-xl bg-gold-500 px-6 py-3 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
          >
            Add Restaurant
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      restaurantName={selectedRestaurant?.name || "Select Restaurant"}
      onAddItem={() => console.log("Add item")}
      onImport={() => setShowImport(true)}
      onGenerateReport={() => console.log("Generate report")}
    >
      <div className="space-y-8">
        {/* Restaurant Selector */}
        {restaurants.length > 1 && (
          <div className="flex items-center gap-4">
            <Store className="w-5 h-5 text-slate-400" />
            <select
              value={selectedRestaurant?.id || ""}
              onChange={(e) => {
                const rest = restaurants.find((r) => r.id === parseInt(e.target.value));
                setSelectedRestaurant(rest || null);
              }}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* KPI Cards */}
        <section>
          <KpiCards data={kpiData} />
        </section>

        {/* Import Interface */}
        {showImport && (
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
        )}

        {/* No Restaurant State */}
        {restaurants.length === 0 && (
          <section className="card p-8 text-center">
            <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-navy-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No Restaurant Yet</h3>
            <p className="text-slate-500 text-sm mb-4">Create your first restaurant to start managing menus.</p>
            <Link
              href="/dashboard/restaurants/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Restaurant
            </Link>
          </section>
        )}

        {/* Menu Items Grid */}
        {restaurants.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Menu Items</h2>
                <p className="text-slate-500 text-sm">Manage and analyze your menu offerings</p>
              </div>
              <Link
                href="/dashboard/restaurants/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Restaurant
              </Link>
            </div>
            
            {menuItems.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-slate-500 mb-4">No menu items yet. Import a menu to get started.</p>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onView={(id) => console.log("View:", id)}
                    onEdit={(id) => console.log("Edit:", id)}
                    onDelete={(id) => console.log("Delete:", id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Profitability Matrix */}
        {menuItems.length > 0 && (
          <section>
            <ProfitabilityMatrix items={menuItems} onItemClick={(item) => console.log("Clicked:", item)} />
          </section>
        )}

        {/* Quick Actions */}
        <section className="card p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/dashboard/restaurants/new"
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-gold-400 hover:bg-gold-50 transition-all"
            >
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Add Restaurant</p>
                <p className="text-xs text-slate-500">Create a new restaurant</p>
              </div>
            </Link>
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-navy-400 hover:bg-navy-50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5 text-navy-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Import Menu</p>
                <p className="text-xs text-slate-500">Upload SQL or CSV file</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-left">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Generate Report</p>
                <p className="text-xs text-slate-500">Export analytics PDF</p>
              </div>
            </button>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

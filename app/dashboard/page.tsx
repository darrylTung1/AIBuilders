"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiCards } from "@/components/KpiCards";
import { MenuItemCard, type MenuItem } from "@/components/MenuItemCard";
import { ProfitabilityMatrix } from "@/components/ProfitabilityMatrix";
import { ImportInterface } from "@/components/ImportInterface";
import { EditMenuModal } from "@/components/EditMenuModal";
import { Store, Utensils, Upload, TrendingUp, Palette, Edit3 } from "lucide-react";

type Menu = { id: number; name: string; version: number };
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
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  useEffect(() => {
    fetch("/api/menus")
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json();
          throw new Error(data.error || "Failed to fetch menus");
        }
        const data = await r.json();
        const menuList = Array.isArray(data) ? data : [];
        setMenus(menuList);
        if (menuList.length > 0) {
          setSelectedMenu(menuList[0]);
          fetchMenuItems(menuList[0].id);
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
    const res = await fetch("/api/menus/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sql: sql.trim(),
        menuName: fileName || "Imported Menu",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.menu?.id) {
        setMenus((prev) => [...prev, data.menu]);
        setSelectedMenu(data.menu);
        fetchMenuItems(data.menu.id);
        setShowImport(false);
      }
    } else {
      const err = await res.json();
      throw new Error(err.error || "Import failed");
    }
  };

  const handleMenuChange = (menuId: number) => {
    const menu = menus.find((m) => m.id === menuId);
    if (menu) {
      setSelectedMenu(menu);
      fetchMenuItems(menuId);
    }
  };

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
    if (selectedMenu?.id === menuId) {
      setSelectedMenu(updatedMenu);
    }
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
    if (selectedMenu?.id === menuId) {
      setSelectedMenu(null);
      setMenuItems([]);
    }
  }

  const kpiData = {
    totalItems: menuItems.length,
    avgProfitMargin: menuItems.length > 0
      ? menuItems.reduce((acc, item) => acc + item.profitMargin, 0) / menuItems.length
      : 0,
    topPerformers: menuItems.filter((item) => item.profitMargin >= 60 && item.popularityScore >= 70).length,
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
              Check your database connection and refresh the page.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No menus - show onboarding
  if (menus.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto py-12">
          <div className="card p-8 text-center">
            <div className="w-20 h-20 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-10 h-10 text-gold-600" />
            </div>
            <div className="flex justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-2">No Menus Yet</h2>
            <p className="text-slate-500 mb-6">
              Get started by importing your first menu. You&apos;ll then be able to analyze profitability, add photos, and design beautiful menu layouts.
            </p>
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Import Your First Menu
            </button>
          </div>

          {showImport && (
            <ImportInterface
              onImport={handleImport}
              onCancel={() => setShowImport(false)}
            />
          )}
        </div>
      </DashboardLayout>
    );
  }



  // Has menus - show full dashboard
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Menu Selector */}
        {menus.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-600">Active Menu:</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMenu?.id || ""}
                  onChange={(e) => handleMenuChange(parseInt(e.target.value))}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-navy-900 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {selectedMenu && (
                  <button
                    onClick={() => setEditingMenu(selectedMenu)}
                    className="p-2 text-slate-500 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit menu name"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {selectedMenu && (
              <div className="flex items-center gap-2">
                <Link
                  href={`/menus/${selectedMenu.id}/design`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-700 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Design
                </Link>
                <Link
                  href={`/menus/${selectedMenu.id}/analytics`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-700 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Import Interface (toggled) */}
        {showImport && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900">Import Menu</h2>
              <button
                onClick={() => setShowImport(false)}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>
            <ImportInterface
              onImport={handleImport}
              onCancel={() => setShowImport(false)}
            />
          </section>
        )}

        {/* KPI Cards */}
        {menuItems.length > 0 && (
          <section>
            <KpiCards data={kpiData} />
          </section>
        )}

        {/* Menu Items */}
        <section>
          <h2 className="text-lg font-bold text-navy-900 mb-4">Menu Items</h2>
          
          {menuItems.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
              </div>
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-navy-900 mb-2">No Items in This Menu</h3>
              <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">
                This menu doesn&apos;t have any items yet. Import menu data from a SQL file to get started. You can also create a new restaurant if you need to manage multiple locations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 font-medium rounded-lg hover:bg-gold-400 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Menu Data
                </button>
                <Link
                  href="/dashboard/restaurants/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-navy-700 bg-navy-50 rounded-lg hover:bg-navy-100 transition-colors"
                >
                  <Store className="w-4 h-4" />
                  New Restaurant
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {menuItems.map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onView={(id) => router.push(`/menus/${selectedMenu?.id}/design`)}
                  onEdit={(id) => router.push(`/menus/${selectedMenu?.id}/design`)}
                  onDelete={(id) => console.log("Delete:", id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Profitability Matrix - only show when there are items */}
        {menuItems.length > 0 && (
          <section>
            <ProfitabilityMatrix 
              items={menuItems} 
              onItemClick={(item) => router.push(`/menus/${selectedMenu?.id}/design`)} 
            />
          </section>
        )}

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

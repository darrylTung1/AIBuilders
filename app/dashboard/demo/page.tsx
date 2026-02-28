"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { KpiCards } from "@/components/KpiCards";
import { MenuItemCard, type MenuItem } from "@/components/MenuItemCard";
import { ProfitabilityMatrix } from "@/components/ProfitabilityMatrix";
import { ImportInterface } from "@/components/ImportInterface";
import { Plus, Upload, FileText } from "lucide-react";

// Sample data
const sampleItems: MenuItem[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Fresh basil, mozzarella, and tomato sauce on a wood-fired crust",
    price: 14.99,
    category: "Mains",
    popularityScore: 95,
    profitMargin: 65,
    imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop",
  },
  {
    id: 2,
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons, house-made Caesar dressing",
    price: 9.50,
    category: "Starters",
    popularityScore: 72,
    profitMargin: 75,
    imageUrl: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=200&h=200&fit=crop",
  },
  {
    id: 3,
    name: "Tiramisu",
    description: "Espresso-soaked ladyfingers with mascarpone cream",
    price: 8.99,
    category: "Desserts",
    popularityScore: 88,
    profitMargin: 80,
    imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop",
  },
  {
    id: 4,
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce and seasonal vegetables",
    price: 24.99,
    category: "Mains",
    popularityScore: 45,
    profitMargin: 55,
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop",
  },
  {
    id: 5,
    name: "Truffle Fries",
    description: "Crispy fries with truffle oil and parmesan",
    price: 7.99,
    category: "Sides",
    popularityScore: 92,
    profitMargin: 35,
    imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop",
  },
  {
    id: 6,
    name: "Lobster Bisque",
    description: "Creamy lobster soup with cognac and fresh herbs",
    price: 12.99,
    category: "Starters",
    popularityScore: 38,
    profitMargin: 45,
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop",
  },
];

export default function DashboardDemoPage() {
  const [showImport, setShowImport] = useState(false);

  const kpiData = {
    totalItems: sampleItems.length,
    avgProfitMargin: sampleItems.reduce((acc, item) => acc + item.profitMargin, 0) / sampleItems.length,
    topPerformers: sampleItems.filter((item) => item.profitMargin >= 60 && item.popularityScore >= 70).length,
    itemsChange: 12,
    marginChange: 5.2,
    topChange: 8,
  };

  const handleImport = async (sql: string, fileName?: string) => {
    console.log("Importing:", { sql: sql.slice(0, 100), fileName });
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleItemClick = (item: MenuItem) => {
    console.log("Clicked item:", item);
  };

  return (
    <DashboardLayout
      restaurantName="Bella Vista Restaurant"
      onAddItem={() => console.log("Add item clicked")}
      onImport={() => setShowImport(true)}
      onGenerateReport={() => console.log("Generate report clicked")}
    >
      <div className="space-y-8">
        {/* KPI Cards */}
        <section>
          <KpiCards data={kpiData} />
        </section>

        {/* Import Interface (conditional) */}
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

        {/* Menu Items Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900">Menu Items</h2>
              <p className="text-slate-500 text-sm">Manage and analyze your menu offerings</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white font-medium rounded-lg hover:bg-navy-800 transition-colors">
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sampleItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onView={(id) => console.log("View:", id)}
                onEdit={(id) => console.log("Edit:", id)}
                onDelete={(id) => console.log("Delete:", id)}
              />
            ))}
          </div>
        </section>

        {/* Profitability Matrix */}
        <section>
          <ProfitabilityMatrix items={sampleItems} onItemClick={handleItemClick} />
        </section>

        {/* Quick Actions */}
        <section className="card p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:border-gold-400 hover:bg-gold-50 transition-all text-left">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="font-medium text-navy-900">Add New Item</p>
                <p className="text-xs text-slate-500">Create a new menu item</p>
              </div>
            </button>
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

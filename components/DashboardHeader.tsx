"use client";

import { Bell, Search, User, Plus, Upload, FileText } from "lucide-react";

interface DashboardHeaderProps {
  restaurantName: string;
  onAddItem?: () => void;
  onImport?: () => void;
  onGenerateReport?: () => void;
}

export function DashboardHeader({
  restaurantName,
  onAddItem,
  onImport,
  onGenerateReport,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Restaurant Info */}
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Restaurant</span>
              <span className="text-slate-300">/</span>
              <span className="text-navy-900 font-medium">{restaurantName}</span>
            </div>
            <h1 className="text-2xl font-bold text-navy-900">Menu Engineering Dashboard</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search items..."
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none w-64"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 hover:text-navy-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold-500 rounded-full" />
            </button>

            {/* Profile */}
            <button className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-navy-600" />
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={onAddItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Menu
          </button>
          <button
            onClick={onGenerateReport}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </header>
  );
}

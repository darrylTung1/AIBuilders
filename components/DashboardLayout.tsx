"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
  onAddItem?: () => void;
  onImport?: () => void;
  onGenerateReport?: () => void;
}

export function DashboardLayout({
  children,
  restaurantName = "Bella Vista Restaurant",
  onAddItem,
  onImport,
  onGenerateReport,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64">
        <DashboardHeader
          restaurantName={restaurantName}
          onAddItem={onAddItem}
          onImport={onImport}
          onGenerateReport={onGenerateReport}
        />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

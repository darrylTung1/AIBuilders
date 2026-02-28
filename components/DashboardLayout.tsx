"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
  onImport?: () => void;
}

export function DashboardLayout({
  children,
  restaurantName = "Dashboard",
  onImport,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64">
        <DashboardHeader
          restaurantName={restaurantName}
          onImport={onImport}
        />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

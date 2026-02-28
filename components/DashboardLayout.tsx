"use client";

import { TopNav } from "./TopNav";

interface DashboardLayoutProps {
  children: React.ReactNode;
  restaurantName?: string;
}

export function DashboardLayout({
  children,
  restaurantName,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}

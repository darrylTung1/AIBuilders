"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Utensils,
  TrendingUp,
  FileText,
  Settings,
  ChefHat,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/menus", label: "Menus", icon: Utensils },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-navy-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-navy-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MenuEngine</h1>
            <p className="text-navy-300 text-xs">Analytics & Design</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gold-500 text-navy-900 font-medium"
                      : "text-navy-200 hover:bg-navy-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-navy-800">
        <div className="bg-navy-800 rounded-lg p-4">
          <p className="text-navy-300 text-xs mb-2">Pro Plan</p>
          <p className="text-white font-medium text-sm">Bella Vista Restaurant</p>
          <button className="mt-3 w-full py-2 px-3 bg-gold-500 text-navy-900 text-xs font-semibold rounded-md hover:bg-gold-400 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );
}

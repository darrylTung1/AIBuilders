"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChefHat, Home, Palette, TrendingUp } from "lucide-react";

export function TopNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-navy-900 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gold-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-navy-900" />
            </div>
            <span className="font-bold text-lg">MenuEngine</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard") && !pathname.includes("/menus/")
                  ? "bg-gold-500 text-navy-900"
                  : "text-navy-200 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ArrowLeft, Store } from "lucide-react";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), cuisineType: cuisineType.trim() || undefined, theme: theme.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create restaurant");
      if (!data.id) throw new Error("Server did not return a restaurant ID");
      router.push(`/dashboard/restaurants/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-lg">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-navy-600 hover:text-navy-800 font-medium text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">Create Restaurant</h1>
          <p className="text-slate-500 text-sm mt-1">Add a restaurant to start building menus and importing items from SQL.</p>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-100 rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h2 className="font-semibold text-navy-900">Restaurant Details</h2>
                <p className="text-slate-500 text-xs">Enter your restaurant information</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter restaurant name"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Cuisine Type</label>
              <input
                type="text"
                value={cuisineType}
                onChange={(e) => setCuisineType(e.target.value)}
                placeholder="e.g. Italian, Japanese, Mexican"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
              />
              <p className="text-slate-400 text-xs mt-1">Helps AI generate better descriptions</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Theme / Atmosphere</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. cozy, upscale, casual, family-friendly"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none"
              />
              <p className="text-slate-400 text-xs mt-1">Influences the tone of AI-generated content</p>
            </div>
            
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-4">
                <p className="text-rose-700 text-sm font-medium">{error}</p>
                <p className="text-rose-600/80 text-xs mt-1">Check that DATABASE_URL is set and migrations are run.</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full rounded-xl bg-gold-500 py-3 text-navy-900 font-semibold hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Restaurant"}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

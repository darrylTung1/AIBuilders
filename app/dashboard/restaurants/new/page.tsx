"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <div className="max-w-lg">
      <div className="mb-8">
        <Link href="/dashboard" className="text-amber-600 hover:text-amber-700 font-medium text-sm">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-stone-900 mt-2">Create restaurant</h1>
        <p className="text-stone-500 text-sm mt-1">Add a restaurant to start building menus and importing items from SQL.</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Cuisine type</label>
            <input
              type="text"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g. Italian, Japanese"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Theme</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. cozy, upscale"
              className="w-full rounded-lg border border-stone-300 px-3 py-2.5 text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-red-700 text-sm">{error}</p>
              <p className="text-red-600/80 text-xs mt-1">Check that DATABASE_URL is set and migrations are run (see README).</p>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 py-3 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Creating…" : "Create restaurant"}
          </button>
        </form>
      </div>
    </div>
  );
}

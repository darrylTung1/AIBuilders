"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="max-w-md">
      <div className="mb-6">
        <a href="/dashboard" className="text-amber-600 hover:underline text-sm">← Back to Dashboard</a>
        <h1 className="text-2xl font-semibold text-stone-800 mt-2">Create Restaurant</h1>
        <p className="text-stone-500 text-sm mt-1">Add a restaurant to start building menus and importing items.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Cuisine type</label>
          <input
            type="text"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            placeholder="e.g. Italian, Japanese"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Theme</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. cozy, upscale"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900"
          />
        </div>
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-red-700 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">Check that DATABASE_URL is set and migrations are run (see README).</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-600 py-2 text-white font-medium hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Restaurant"}
        </button>
      </form>
    </div>
  );
}

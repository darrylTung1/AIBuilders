import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight max-w-2xl mx-auto leading-tight">
        Restaurant menu design, powered by AI
      </h1>
      <p className="text-stone-600 text-lg mt-6 max-w-xl mx-auto">
        Import your menu via SQL, add photos and descriptions, highlight bestsellers, and export polished menus and analytics.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-8 py-4 text-white font-semibold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/dashboard/restaurants/new"
          className="inline-flex items-center justify-center rounded-xl border-2 border-stone-300 px-8 py-4 text-stone-700 font-semibold hover:border-stone-400 hover:bg-stone-50 transition-colors"
        >
          Add your first restaurant
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <span className="text-amber-500 font-semibold text-sm">Import</span>
          <p className="text-stone-600 text-sm mt-1">Upload a SQL file or paste your menu data (items, prices, popularity) to get started.</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <span className="text-amber-500 font-semibold text-sm">Design</span>
          <p className="text-stone-600 text-sm mt-1">Add photos, AI descriptions, and mark recommended items. Preview your menu in real time.</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <span className="text-amber-500 font-semibold text-sm">Export</span>
          <p className="text-stone-600 text-sm mt-1">View profitability and popularity analytics, then export your menu as PDF.</p>
        </div>
      </div>
    </div>
  );
}

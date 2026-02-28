import Link from "next/link";

export default function HomePage() {
  return (
    <div className="text-center py-16">
      <h1 className="text-3xl font-bold text-stone-800 mb-4">
        Restaurant Menu Engineering Tool
      </h1>
      <p className="text-stone-600 mb-8 max-w-xl mx-auto">
        Import your menu via SQL, design with AI-generated descriptions and food
        photography, and export analytics and PDF menus.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-3 text-white font-medium hover:bg-amber-700 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}

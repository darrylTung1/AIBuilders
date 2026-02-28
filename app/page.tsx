import Link from "next/link";
import { ChefHat, Upload, Palette, FileText, ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-14 h-14 bg-gold-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-navy-900" />
              </div>
              <span className="text-2xl font-bold text-white">MenuEngine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight max-w-3xl mx-auto leading-tight">
              Restaurant menu design,{" "}
              <span className="text-gold-400">powered by AI</span>
            </h1>
            
            <p className="text-navy-200 text-lg sm:text-xl mt-6 max-w-2xl mx-auto">
              Import your menu via SQL, add photos and descriptions, highlight bestsellers, and export polished menus with professional analytics.
            </p>

            <div className="mt-10">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-navy-900 font-semibold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-100 text-gold-700 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
              Everything you need to engineer your menu
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-navy-100 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="font-semibold text-navy-900 text-lg">Import</h3>
              <p className="text-slate-600 text-sm mt-2">
                Upload a SQL file or paste your menu data (items, prices, popularity) to get started in seconds.
              </p>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gold-100 rounded-xl flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-gold-600" />
              </div>
              <h3 className="font-semibold text-navy-900 text-lg">Design</h3>
              <p className="text-slate-600 text-sm mt-2">
                Add photos, AI-generated descriptions, and mark recommended items. Preview your menu in real time.
              </p>
            </div>

            <div className="card p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-navy-900 text-lg">Export</h3>
              <p className="text-slate-600 text-sm mt-2">
                View profitability and popularity analytics with the Boston Matrix, then export your menu as PDF.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to optimize your menu?
          </h2>
          <p className="text-navy-300 mb-8">
            Start engineering your menu today with AI-powered insights.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-8 py-4 text-navy-900 font-semibold hover:bg-gold-400 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

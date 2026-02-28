import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu Engineering Tool",
  description: "AI-powered restaurant menu design and analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen text-stone-900">
        <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-stone-900 tracking-tight hover:text-amber-600 transition-colors">
              Menu Engineering
            </a>
            <nav className="flex items-center gap-6">
              <a href="/dashboard" className="text-stone-600 hover:text-stone-900 font-medium text-sm transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}

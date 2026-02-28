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
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900">
        <header className="border-b border-stone-200 bg-white/80 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="font-semibold text-lg text-stone-800">
              Menu Engineering Tool
            </a>
            <nav className="flex gap-6">
              <a href="/dashboard" className="text-stone-600 hover:text-stone-900">
                Dashboard
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

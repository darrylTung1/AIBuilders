"use client";

import { useState, useRef } from "react";

const SAMPLE_SQL = `INSERT INTO menu (name, description, price, popularity, category) VALUES
('Margherita Pizza', 'Fresh basil, mozzarella, and tomato', 14.99, 95, 'Mains'),
('Caesar Salad', 'Romaine, parmesan, croutons, Caesar dressing', 9.50, 72, 'Starters'),
('Tiramisu', 'Espresso-soaked ladyfingers with mascarpone', 8.99, 120, 'Desserts');`;

type Props = {
  restaurantId: number;
  onSuccess: (menuId: number) => void;
  onError: (message: string) => void;
};

export function SqlImportCard({ restaurantId, onSuccess, onError }: Props) {
  const [mode, setMode] = useState<"file" | "paste">("paste");
  const [pasteSql, setPasteSql] = useState("");
  const [menuName, setMenuName] = useState("Imported Menu");
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function runImport(sql: string) {
    if (!sql.trim()) {
      onError("Enter or upload SQL content.");
      return;
    }
    setImporting(true);
    onError("");
    try {
      const res = await fetch("/api/menus/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: sql.trim(),
          restaurantId,
          menuName: menuName.trim() || "Imported Menu",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      if (data.menu?.id) onSuccess(data.menu.id);
      else throw new Error("No menu returned");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name.replace(/\.sql$/i, "").trim() || "Imported Menu";
    setMenuName(name);
    file.text().then((sql) => runImport(sql));
    e.target.value = "";
  }

  function handlePasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    runImport(pasteSql);
  }

  function loadSample() {
    setPasteSql(SAMPLE_SQL);
    setMode("paste");
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/80">
        <h3 className="font-semibold text-stone-800">Import menu from SQL</h3>
        <p className="text-stone-500 text-sm mt-0.5">
          Upload a .sql file or paste an INSERT statement with columns: name, description, price, popularity, category
        </p>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === "paste" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            Paste SQL
          </button>
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === "file" ? "bg-amber-500 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"}`}
          >
            Upload file
          </button>
          <button
            type="button"
            onClick={loadSample}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
          >
            Load sample
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Menu name (after import)</label>
          <input
            type="text"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
            placeholder="Imported Menu"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {mode === "paste" ? (
          <form onSubmit={handlePasteSubmit} className="space-y-3">
            <textarea
              value={pasteSql}
              onChange={(e) => setPasteSql(e.target.value)}
              placeholder="Paste your INSERT INTO ... VALUES (...); statement here"
              rows={8}
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm font-mono text-stone-800 placeholder:text-stone-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-y min-h-[120px]"
            />
            <button
              type="submit"
              disabled={importing || !pasteSql.trim()}
              className="w-full rounded-lg bg-amber-500 py-2.5 text-white text-sm font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {importing ? "Importing…" : "Import menu"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full rounded-xl border-2 border-dashed border-stone-300 py-8 text-stone-500 hover:border-amber-400 hover:bg-amber-50/50 hover:text-stone-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {importing ? "Importing…" : "Choose .sql file to upload"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

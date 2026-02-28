"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, X, Database, FileSpreadsheet } from "lucide-react";

interface ImportInterfaceProps {
  onImport: (sql: string, fileName?: string) => Promise<void>;
  onCancel?: () => void;
}

type ImportState = "idle" | "dragging" | "parsing" | "preview" | "success" | "error";

interface ParsedRow {
  name: string;
  description: string;
  price: number;
  popularity: number;
  category: string;
}

export function ImportInterface({ onImport, onCancel }: ImportInterfaceProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sqlInput, setSqlInput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const SAMPLE_SQL = `INSERT INTO menu (name, description, price, popularity, category) VALUES
('Margherita Pizza', 'Fresh basil, mozzarella, and tomato', 14.99, 95, 'Mains'),
('Caesar Salad', 'Romaine, parmesan, croutons, Caesar dressing', 9.50, 72, 'Starters'),
('Tiramisu', 'Espresso-soaked ladyfingers with mascarpone', 8.99, 120, 'Desserts');`;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.name.match(/\.(sql|csv|xlsx?)$/i)) {
      setError("Please upload a .sql, .csv, or .xlsx file");
      setState("error");
      return;
    }

    setFileName(file.name);
    setState("parsing");

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSqlInput(content);
      parsePreview(content);
    };
    reader.readAsText(file);
  };

  const parsePreview = (sql: string) => {
    // Simple regex to extract values for preview
    const valuesMatch = sql.match(/VALUES\s+(.+)/i);
    if (valuesMatch) {
      // This is a simplified preview parser
      const rows: ParsedRow[] = [];
      const rowRegex = /\('([^']+)'\s*,\s*'([^']*)'\s*,\s*([\d.]+)\s*,\s*(\d+)\s*,\s*'([^']+)'\)/g;
      let match;
      while ((match = rowRegex.exec(sql)) !== null) {
        rows.push({
          name: match[1],
          description: match[2],
          price: parseFloat(match[3]),
          popularity: parseInt(match[4]),
          category: match[5],
        });
      }
      setPreviewData(rows.slice(0, 5));
      setState("preview");
    } else {
      setError("Could not parse SQL. Please check the format.");
      setState("error");
    }
  };

  const handlePasteSubmit = async () => {
    if (!sqlInput.trim()) {
      setError("Please enter SQL content");
      setState("error");
      return;
    }
    await onImport(sqlInput, "pasted-sql");
    setState("success");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const loadSample = () => {
    setSqlInput(SAMPLE_SQL);
    parsePreview(SAMPLE_SQL);
  };

  const clearError = () => {
    setError(null);
    setState("idle");
  };

  if (state === "success") {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">Import Successful!</h3>
        <p className="text-slate-500 text-sm mb-4">Your menu items have been imported successfully.</p>
        <button
          onClick={() => setState("idle")}
          className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
        >
          Import More
        </button>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="card p-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-navy-900 mb-1">Import Failed</h3>
            <p className="text-slate-500 text-sm mb-4">{error}</p>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === "preview") {
    return (
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-navy-900">Preview Import</h3>
              <p className="text-slate-500 text-sm">
                {fileName ? `File: ${fileName}` : "Pasted SQL content"}
              </p>
            </div>
            <button
              onClick={() => setState("idle")}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Name</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Category</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-600">Price</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-600">Popularity</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 px-3 font-medium text-navy-900">{row.name}</td>
                    <td className="py-2 px-3 text-slate-600">{row.category}</td>
                    <td className="py-2 px-3 text-right text-navy-900">${row.price.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 bg-gold-100 text-gold-700 rounded text-xs font-medium">
                        {row.popularity}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {previewData.length >= 5 && (
            <p className="text-slate-400 text-xs mt-3 text-center">Showing first 5 items...</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={() => setState("idle")}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePasteSubmit}
            className="px-6 py-2 bg-gold-500 text-navy-900 font-semibold rounded-lg hover:bg-gold-400 transition-colors"
          >
            Confirm Import
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <h3 className="font-semibold text-navy-900">Import Menu Items</h3>
        <p className="text-slate-500 text-sm mt-1">
          Upload a file or paste SQL to import your menu data
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            state === "dragging"
              ? "border-gold-500 bg-gold-50"
              : "border-slate-300 hover:border-navy-400 hover:bg-slate-50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.csv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-navy-600" />
          </div>
          <p className="font-medium text-navy-900 mb-1">
            Drop your file here, or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            Supports .sql, .csv, .xlsx files
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Database className="w-4 h-4" />
              <span>SQL</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FileText className="w-4 h-4" />
              <span>CSV</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-slate-400">or paste SQL directly</span>
          </div>
        </div>

        {/* SQL Input */}
        <div>
          <textarea
            value={sqlInput}
            onChange={(e) => setSqlInput(e.target.value)}
            placeholder="Paste your INSERT INTO statement here..."
            rows={6}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg font-mono text-sm text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none resize-y"
          />
          <div className="flex items-center justify-between mt-3">
            <button
              onClick={loadSample}
              className="text-sm text-navy-600 hover:text-navy-800 font-medium"
            >
              Load sample SQL
            </button>
            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handlePasteSubmit}
                disabled={!sqlInput.trim() || state === "parsing"}
                className="px-6 py-2 bg-navy-900 text-white font-medium rounded-lg hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state === "parsing" ? "Parsing..." : "Preview Import"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { X, Edit3, Trash2 } from "lucide-react";

type Props = {
  menu: { id: number; name: string };
  onSave: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClose: () => void;
};

export function EditMenuModal({ menu, onSave, onDelete, onClose }: Props) {
  const [name, setName] = useState(menu.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      await onSave(menu.id, name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete menu "${menu.name}"? This will also delete all menu items.`)) return;
    
    setLoading(true);
    setError(null);
    try {
      await onDelete(menu.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full card">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-navy-900">Edit Menu</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label htmlFor="menuName" className="block text-sm font-medium text-navy-900 mb-2">
              Menu Name
            </label>
            <input
              id="menuName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-navy-900 placeholder:text-slate-400 focus:border-navy-500 focus:ring-2 focus:ring-navy-200 outline-none disabled:bg-slate-50"
              disabled={loading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete Menu
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import { ImageUpload } from "./ImageUpload";
import type { MenuItem } from "@/lib/db/schema";

type Props = {
  item: MenuItem;
  cuisineType?: string;
  theme?: string;
  onSave: (updates: Partial<MenuItem>) => void;
  onDelete?: () => void;
};

export function MenuItemEditor({ item, cuisineType, theme, onSave, onDelete }: Props) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [price, setPrice] = useState(String(item.price));
  const [category, setCategory] = useState(item.category ?? "");
  const [isRecommended, setIsRecommended] = useState(item.isRecommended ?? false);
  const [imageUrl, setImageUrl] = useState(item.imageUrl ?? "");
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);

  function save() {
    onSave({
      name: name.trim(),
      description: description.trim() || null,
      price: price.trim(),
      category: category.trim() || null,
      isRecommended,
      imageUrl: imageUrl || null,
    });
  }

  async function generateDescription() {
    setLoadingDesc(true);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name || item.name, cuisineType, theme }),
      });
      const data = await res.json();
      if (data.description) setDescription(data.description);
    } finally {
      setLoadingDesc(false);
    }
  }

  async function suggestPricing() {
    setLoadingPrice(true);
    try {
      const res = await fetch("/api/ai/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemName: name || item.name,
          description: description || undefined,
          currentPrice: Number(price) || 0,
          cuisineType,
        }),
      });
      const data = await res.json();
      if (data.suggestion) alert(data.suggestion);
    } finally {
      setLoadingPrice(false);
    }
  }

  async function generateImage() {
    setLoadingImage(true);
    try {
      const res = await fetch("/api/ai/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemName: name || item.name, cuisineType, theme }),
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-4 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={save}
              className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Description</label>
            <div className="flex gap-1">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={save}
                rows={2}
                className="flex-1 rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={generateDescription}
                disabled={loadingDesc}
                className="text-xs text-amber-600 hover:underline self-start disabled:opacity-50"
              >
                {loadingDesc ? "..." : "AI"}
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-500 mb-1">Price</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={save}
                className="w-24 rounded border border-stone-300 px-2 py-1.5 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={suggestPricing}
              disabled={loadingPrice}
              className="text-xs text-amber-600 hover:underline self-end disabled:opacity-50"
            >
              {loadingPrice ? "..." : "Suggest price"}
            </button>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onBlur={save}
              placeholder="e.g. Mains, Desserts"
              className="w-full rounded border border-stone-300 px-2 py-1.5 text-sm"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecommended}
              onChange={(e) => {
                setIsRecommended(e.target.checked);
                onSave({ isRecommended: e.target.checked });
              }}
              className="rounded border-stone-300"
            />
            <span className="text-sm text-stone-700">Recommended</span>
          </label>
        </div>
        <div>
          <ImageUpload
            label="Food photo"
            value={imageUrl || null}
            onChange={(url) => { setImageUrl(url); onSave({ imageUrl: url }); }}
            alt={name}
          />
          <button
            type="button"
            onClick={generateImage}
            disabled={loadingImage}
            className="mt-2 text-xs text-amber-600 hover:underline disabled:opacity-50"
          >
            {loadingImage ? "Generating..." : "Generate with AI"}
          </button>
        </div>
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} className="text-xs text-red-600 hover:underline">
          Delete item
        </button>
      )}
    </div>
  );
}

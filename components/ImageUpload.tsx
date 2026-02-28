"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  value: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
  alt?: string;
  label?: string;
};

export function ImageUpload({ value, onChange, disabled, alt = "Menu item", label = "Food image" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-stone-500">{label}</label>
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl overflow-hidden bg-stone-50 flex items-center justify-center
          w-full min-h-[140px] cursor-pointer transition-colors
          ${value ? "border-stone-200" : "border-stone-300"}
          ${dragOver ? "border-amber-500 bg-amber-50" : ""}
          ${disabled || uploading ? "opacity-60 cursor-not-allowed" : "hover:border-amber-400 hover:bg-stone-100"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />
        {value ? (
          <div className="relative w-full aspect-square max-w-[200px] mx-auto">
            <Image
              src={value}
              alt={alt}
              fill
              className="object-cover rounded-lg"
              unoptimized
              sizes="200px"
            />
          </div>
        ) : (
          <div className="text-center p-4">
            {uploading ? (
              <p className="text-stone-500 text-sm">Uploading...</p>
            ) : (
              <>
                <p className="text-stone-600 text-sm font-medium">Upload food photo</p>
                <p className="text-stone-400 text-xs mt-1">Click or drag and drop an image</p>
              </>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {value && (
          <>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              disabled={disabled || uploading}
              className="text-xs text-amber-600 hover:underline disabled:opacity-50"
            >
              Change photo
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              disabled={disabled}
              className="text-xs text-stone-500 hover:underline"
            >
              Remove
            </button>
          </>
        )}
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

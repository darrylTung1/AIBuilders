"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  value: string | null;
  onChange: (url: string) => void;
  disabled?: boolean;
  alt?: string;
};

export function ImageUpload({ value, onChange, disabled, alt = "Menu item" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
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
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50 w-24 h-24 flex items-center justify-center">
        {value ? (
          <Image src={value} alt={alt} width={96} height={96} className="object-cover w-full h-full" unoptimized />
        ) : (
          <span className="text-stone-400 text-xs text-center px-2">No image</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={disabled || uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="text-xs text-amber-600 hover:underline disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={disabled}
            className="text-xs text-stone-500 hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}

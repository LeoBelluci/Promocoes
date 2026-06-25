"use client";

import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  storeId?: string;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function ImageUpload({
  value,
  onChange,
  storeId,
  disabled = false
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecione um arquivo de imagem.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("A imagem deve ter no maximo 5MB.");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("store_id", storeId ?? "");

      const response = await fetch("/api/uploads/product-image", {
        method: "POST",
        body: formData
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel enviar a imagem.");
      }

      onChange(payload.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Nao foi possivel enviar a imagem."
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        disabled={disabled || uploading}
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {value ? (
            <Image src={value} alt="Imagem do produto" fill sizes="96px" className="object-cover" />
          ) : (
            <ImageIcon aria-hidden="true" className="h-8 w-8 text-slate-400" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50 disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            ) : (
              <Upload aria-hidden="true" className="h-4 w-4" />
            )}
            {uploading ? "Enviando" : "Enviar imagem"}
          </button>

          {value ? (
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange(null)}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-rose-200 hover:bg-rose-50 disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Remover
            </button>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

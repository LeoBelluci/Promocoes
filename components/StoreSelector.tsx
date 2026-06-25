"use client";

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { stores, type StoreId } from "@/lib/stores";

interface StoreSelectorProps {
  selectedStore?: string;
  onChange: (storeId: StoreId) => void;
  disabled?: boolean;
}

export default function StoreSelector({
  selectedStore,
  onChange,
  disabled = false
}: StoreSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stores.map((store) => {
        const selected = selectedStore === store.id;

        return (
          <button
            key={store.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(store.id)}
            className={[
              "relative flex min-h-28 items-center gap-4 rounded-lg border bg-white p-4 text-left transition",
              "hover:border-yellow-300 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-yellow-300",
              selected
                ? "border-yellow-400 bg-yellow-50 shadow-soft"
                : "border-slate-200",
              disabled ? "opacity-60" : ""
            ].join(" ")}
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
              <Image
                src={store.logo}
                alt={`${store.name} logo`}
                width={96}
                height={28}
                className="max-h-9 w-auto object-contain"
              />
            </span>

            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-950">{store.name}</span>
              <span className="mt-1 block text-sm text-slate-500">{store.marketplace}</span>
            </span>

            {selected ? (
              <CheckCircle2
                aria-hidden="true"
                className="absolute right-3 top-3 h-5 w-5 text-emerald-600"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

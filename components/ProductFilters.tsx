"use client";

import { RotateCcw, Search } from "lucide-react";
import { stores } from "@/lib/stores";
import { promotionStatuses, type ProductFiltersState } from "@/types/product";

interface ProductFiltersProps {
  filters: ProductFiltersState;
  onChange: (filters: Partial<ProductFiltersState>) => void;
  onReset: () => void;
  lockedStoreId?: string;
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  expired: "Expirado",
  renewed: "Renovado",
  inactive: "Inativo"
};

export default function ProductFilters({
  filters,
  onChange,
  onReset,
  lockedStoreId
}: ProductFiltersProps) {
  const storeOptions = lockedStoreId
    ? stores.filter((store) => store.id === lockedStoreId)
    : stores;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="mb-4 block space-y-1.5">
        <span className="text-xs font-semibold uppercase text-slate-500">Busca rapida</span>
        <span className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            className="h-11 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            placeholder="Buscar por produto, SKU ou cupom"
          />
        </span>
      </label>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Loja</span>
          <select
            value={filters.store_id}
            disabled={Boolean(lockedStoreId)}
            onChange={(event) => onChange({ store_id: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100 disabled:bg-slate-100"
          >
            {lockedStoreId ? null : <option value="">Todas</option>}
            {storeOptions.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Marketplace</span>
          <select
            value={filters.marketplace}
            onChange={(event) => onChange({ marketplace: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          >
            <option value="">Todos</option>
            <option value="Mercado Livre">Mercado Livre</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Produto</span>
          <input
            value={filters.product_name}
            onChange={(event) => onChange({ product_name: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            placeholder="Nome do produto"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">SKU</span>
          <input
            value={filters.sku}
            onChange={(event) => onChange({ sku: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            placeholder="SKU"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Codigo</span>
          <input
            value={filters.promo_code}
            onChange={(event) => onChange({ promo_code: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
            placeholder="Cupom"
          />
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Promocao</span>
          <select
            value={filters.promotion}
            onChange={(event) => onChange({ promotion: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          >
            <option value="">Todas</option>
            <option value="true">Ativa</option>
            <option value="false">Inativa</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Status</span>
          <select
            value={filters.status}
            onChange={(event) => onChange({ status: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          >
            <option value="">Todos</option>
            {promotionStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-xs font-semibold uppercase text-slate-500">Data final</span>
          <input
            type="date"
            value={filters.ending_date}
            onChange={(event) => onChange({ ending_date: event.target.value })}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ending_today: true, ending_next_3_days: false, expired: false })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          Terminam hoje
        </button>

        <button
          type="button"
          onClick={() => onChange({ ending_today: false, ending_next_3_days: true, expired: false })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          Proximos 3 dias
        </button>

        <button
          type="button"
          onClick={() => onChange({ ending_today: false, ending_next_3_days: false, expired: true })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          Expirados
        </button>

        <button
          type="button"
          onClick={() => onChange({ status: "active", expired: false })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          Ativos
        </button>

        <button
          type="button"
          onClick={() => onChange({ status: "renewed", expired: false })}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          Renovados
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Limpar
        </button>
      </div>
    </section>
  );
}

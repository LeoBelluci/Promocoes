"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ProductFilters from "@/components/ProductFilters";
import ProductTable from "@/components/ProductTable";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import {
  buildProductQueryString,
  defaultProductFilters
} from "@/lib/productFilters";
import type { ProductFiltersState, ProductPromotion, ProductStats } from "@/types/product";

interface DashboardProps {
  title?: string;
  description?: string;
  initialFilters?: Partial<ProductFiltersState>;
  lockedStoreId?: string;
  createHref?: string;
  stats?: ProductStats;
}

function mergeFilters(filters?: Partial<ProductFiltersState>) {
  return {
    ...defaultProductFilters,
    ...filters
  };
}

function StatCard({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

export default function Dashboard({
  title = "Promoções de produtos",
  description = "Gerencie campanhas, imagens, lojas e lembretes de renovação.",
  initialFilters,
  lockedStoreId,
  createHref = "/products/new",
  stats
}: DashboardProps) {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<ProductFiltersState>(() =>
    mergeFilters({
      ...initialFilters,
      store_id: lockedStoreId ?? initialFilters?.store_id ?? ""
    })
  );
  const [products, setProducts] = useState<ProductPromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductPromotion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const queryString = useMemo(() => buildProductQueryString(filters), [filters]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = lockedStoreId
        ? `/api/stores/${lockedStoreId}/products`
        : "/api/products";
      const response = await fetch(`${endpoint}${queryString ? `?${queryString}` : ""}`, {
        cache: "no-store"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível carregar as promoções.");
      }

      setProducts(payload?.data ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as promoções."
      );
    } finally {
      setLoading(false);
    }
  }, [lockedStoreId, queryString]);

  useEffect(() => {
    const delay = filters.search ? 350 : 0;
    const timer = window.setTimeout(() => {
      void loadProducts();
    }, delay);

    return () => window.clearTimeout(timer);
  }, [filters.search, loadProducts]);

  function handleFilterChange(nextFilters: Partial<ProductFiltersState>) {
    setFilters((current) => ({
      ...current,
      ...nextFilters,
      store_id: lockedStoreId ?? nextFilters.store_id ?? current.store_id
    }));
  }

  function handleReset() {
    setFilters(
      mergeFilters({
        store_id: lockedStoreId ?? ""
      })
    );
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeletingId(pendingDelete.id);

    try {
      const response = await fetch(`/api/products/${pendingDelete.id}`, {
        method: "DELETE"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Não foi possível excluir a promoção.");
      }

      setProducts((current) => current.filter((item) => item.id !== pendingDelete.id));
      showToast("success", "Promoção excluída.");
      setPendingDelete(null);
    } catch (deleteError) {
      showToast(
        "error",
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir a promoção."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link
            href={createHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Nova promoção
          </Link>
        }
      />

      {stats ? (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Produtos" value={stats.total} />
          <StatCard label="Promoções ativas" value={stats.activePromotions} />
          <StatCard label="Terminando em breve" value={stats.endingSoon} />
          <StatCard label="Expiradas" value={stats.expired} />
        </section>
      ) : null}

      <ProductFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
        lockedStoreId={lockedStoreId}
      />

      {loading ? (
        <LoadingState label="Carregando promoções" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadProducts()} />
      ) : products.length > 0 ? (
        <ProductTable
          products={products}
          deletingId={deletingId}
          onDelete={setPendingDelete}
          onMessageResult={showToast}
        />
      ) : (
        <EmptyState
          title="Nenhuma promoção encontrada"
          description="Ajuste os filtros ou cadastre uma nova promoção para começar."
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir promoção"
        description={
          pendingDelete
            ? `Excluir "${pendingDelete.product_name}"? Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        loading={Boolean(deletingId)}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}

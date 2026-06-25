"use client";

import { Edit3, Eye, ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import SendMessageButton from "@/components/SendMessageButton";
import StatusBadge from "@/components/StatusBadge";
import { formatDateBR } from "@/lib/dates";
import { formatCurrencyBRL } from "@/lib/formatters";
import { getStoreById, getStoreName } from "@/lib/stores";
import type { ProductPromotion } from "@/types/product";

interface ProductTableProps {
  products: ProductPromotion[];
  deletingId?: string | null;
  onDelete: (product: ProductPromotion) => void;
  onMessageResult: (type: "success" | "error", message: string) => void;
}

export default function ProductTable({
  products,
  deletingId,
  onDelete,
  onMessageResult
}: ProductTableProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {products.map((product) => {
          const store = getStoreById(product.store_id);
          const detailHref = `${store?.route ?? ""}/products/${product.id}`;

          return (
            <article
              key={product.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.product_name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <ImageIcon aria-hidden="true" className="h-7 w-7 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-950">
                    {product.product_name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">{getStoreName(product.store_id)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <StatusBadge status={product.status} />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      SKU {product.sku}
                    </span>
                  </div>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-400">Termino</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {formatDateBR(product.ending_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-400">Renovacao</dt>
                  <dd className="mt-1 font-medium text-slate-800">
                    {formatCurrencyBRL(product.renewal_value)}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex justify-end gap-2">
                <Link
                  href={detailHref}
                  title="Ver detalhes"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
                >
                  <Eye aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes</span>
                </Link>
                <Link
                  href={`/products/${product.id}/edit`}
                  title="Editar promoção"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
                >
                  <Edit3 aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Link>
                <SendMessageButton productId={product.id} onResult={onMessageResult} />
                <button
                  type="button"
                  disabled={deletingId === product.id}
                  onClick={() => onDelete(product)}
                  title="Excluir promoção"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  <span className="sr-only">Excluir</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Produto
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Loja
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                SKU
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Promoção
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Termino
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Codigo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Renovacao
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Telefone
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                Acoes
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => {
              const store = getStoreById(product.store_id);
              const detailHref = `${store?.route ?? ""}/products/${product.id}`;

              return (
                <tr key={product.id} className="hover:bg-yellow-50/40">
                  <td className="min-w-72 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon aria-hidden="true" className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-950">
                          {product.product_name}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{product.marketplace}</div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-56 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
                        <Image
                          src={store?.marketplaceLogo ?? "/logos/mercado-livre-login.jpg"}
                          alt={`${product.marketplace} logo`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {getStoreName(product.store_id)}
                        </div>
                        <div className="text-xs text-slate-500">{product.marketplace}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm font-medium text-slate-700">{product.sku}</td>
                  <td className="px-4 py-4 text-sm">
                    <span
                      className={`inline-flex min-w-16 justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.promotion
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {product.promotion ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {formatDateBR(product.ending_date)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    {product.promo_code || "-"}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                    {formatCurrencyBRL(product.renewal_value)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">{product.phone_number}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={detailHref}
                        title="Ver detalhes"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
                      >
                        <Eye aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">Ver detalhes</span>
                      </Link>

                      <Link
                        href={`/products/${product.id}/edit`}
                        title="Editar promoção"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
                      >
                        <Edit3 aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Link>

                      <SendMessageButton
                        productId={product.id}
                        onResult={onMessageResult}
                      />

                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => onDelete(product)}
                        title="Excluir promoção"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50 disabled:opacity-60"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        <span className="sr-only">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

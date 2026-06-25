import { ArrowLeft, Edit3, ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductMessageAction from "@/components/products/ProductMessageAction";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { formatDateBR } from "@/lib/dates";
import { formatCurrencyBRL } from "@/lib/formatters";
import { getStoreById } from "@/lib/stores";
import type { ProductPromotion, SentMessage } from "@/types/product";

interface ProductDetailsProps {
  product: ProductPromotion;
  messages: SentMessage[];
}

export default function ProductDetails({ product, messages }: ProductDetailsProps) {
  const store = getStoreById(product.store_id);
  const backHref = store?.route ?? "/dashboard";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backHref}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar para loja
        </Link>
        <div className="flex gap-2">
          <ProductMessageAction productId={product.id} />
          <Link
            href={`/products/${product.id}/edit`}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Edit3 aria-hidden="true" className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.product_name}
                fill
                sizes="(min-width: 1024px) 360px, 100vw"
                className="object-cover"
              />
            ) : (
              <ImageIcon aria-hidden="true" className="h-16 w-16 text-slate-400" />
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">{store?.name}</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">{product.product_name}</h1>
            </div>
            <StatusBadge status={product.status} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["SKU", product.sku],
              ["Marketplace", product.marketplace],
              ["Promocao", product.promotion ? "Ativa" : "Inativa"],
              ["Termino", formatDateBR(product.ending_date)],
              ["Codigo", product.promo_code ?? "-"],
              ["Telefone", product.phone_number],
              ["Renovacao", formatCurrencyBRL(product.renewal_value)],
              ["Criado em", formatDateBR(product.created_at?.slice(0, 10))],
              ["Atualizado em", formatDateBR(product.updated_at?.slice(0, 10))]
            ].map(([label, value]) => (
              <div key={label} className="rounded-md bg-slate-50 p-3">
                <dt className="text-xs font-semibold uppercase text-slate-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Historico de mensagens</h2>
        {messages.length > 0 ? (
          <div className="mt-4 divide-y divide-slate-100">
            {messages.map((message) => (
              <article key={message.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-900">{message.phone_number}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {new Date(message.sent_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{message.message}</p>
                <p className="mt-2 text-xs font-semibold uppercase text-slate-400">
                  {message.provider ?? "whatsapp-web"} - {message.status ?? "registrada"} -{" "}
                  {message.trigger_type ?? "manual"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              title="Nenhuma mensagem enviada"
              description="Os lembretes manuais e automaticos deste produto aparecerao aqui."
            />
          </div>
        )}
      </section>
    </div>
  );
}

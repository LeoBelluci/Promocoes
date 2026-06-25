import Image from "next/image";
import Link from "next/link";
import Dashboard from "@/components/Dashboard";
import { getProductStats } from "@/lib/services/productService";
import { getStoreById, type StoreId } from "@/lib/stores";

interface StorePageProps {
  storeId: StoreId;
}

export default async function StorePage({ storeId }: StorePageProps) {
  const store = getStoreById(storeId);

  if (!store) {
    return null;
  }

  const stats = await getProductStats(store.id);

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-soft">
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src="/logos/mercado-livre-login.jpg"
              alt="Mercado Livre"
              width={96}
              height={96}
              priority
              className="h-14 w-14 shrink-0 rounded-md object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">Promoções</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Central da loja para acompanhar produtos, campanhas e lembretes de renovação.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center">
            <Image
              src={store.marketplaceLogo}
              alt="Mercado Livre"
              width={42}
              height={42}
              className="h-10 w-10 rounded-md object-contain"
            />
            <div>
              <p className="text-xs font-semibold uppercase text-yellow-300">Marketplace</p>
              <p className="text-sm font-semibold text-white">{store.marketplace}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-yellow-300 px-5 py-3 text-sm font-semibold text-slate-950">
          <Link href={`/products/new?store_id=${store.id}`}>Criar promoção para {store.name}</Link>
        </div>
      </section>

      <Dashboard
        title="Promoções"
        description="Produtos, filtros e ações desta loja."
        initialFilters={{ store_id: store.id }}
        lockedStoreId={store.id}
        createHref={`/products/new?store_id=${store.id}`}
        stats={stats}
      />
    </div>
  );
}

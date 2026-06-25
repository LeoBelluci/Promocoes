import AdminShell from "@/components/layout/AdminShell";
import ProductForm from "@/components/ProductForm";
import { requirePageAuth } from "@/lib/auth/requireAuth";
import { isValidStoreId } from "@/lib/stores";

type NewProductPromotionPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewProductPromotionPage({
  searchParams
}: NewProductPromotionPageProps) {
  const user = await requirePageAuth();
  const params = await searchParams;
  const storeId = typeof params.store_id === "string" && isValidStoreId(params.store_id)
    ? params.store_id
    : undefined;

  return (
    <AdminShell user={user}>
      <div className="mx-auto w-full max-w-5xl">
        <ProductForm mode="create" initialStoreId={storeId} />
      </div>
    </AdminShell>
  );
}

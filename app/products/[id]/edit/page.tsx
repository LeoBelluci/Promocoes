import { notFound } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import ProductForm from "@/components/ProductForm";
import { requirePageAuth } from "@/lib/auth/requireAuth";
import { getProductById } from "@/lib/services/productService";

type EditProductPromotionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPromotionPage({
  params
}: EditProductPromotionPageProps) {
  const user = await requirePageAuth();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <AdminShell user={user}>
      <div className="mx-auto w-full max-w-5xl">
        <ProductForm mode="edit" initialData={product} />
      </div>
    </AdminShell>
  );
}

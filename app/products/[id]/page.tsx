import { notFound, redirect } from "next/navigation";
import { requirePageAuth } from "@/lib/auth/requireAuth";
import { getProductById } from "@/lib/services/productService";
import { getStoreById } from "@/lib/stores";

type ProductDetailsRedirectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailsRedirectPage({
  params
}: ProductDetailsRedirectPageProps) {
  await requirePageAuth();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const store = getStoreById(product.store_id);

  if (!store) {
    notFound();
  }

  redirect(`${store.route}/products/${product.id}`);
}

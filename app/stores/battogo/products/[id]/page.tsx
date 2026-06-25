import { notFound } from "next/navigation";
import AdminShell from "@/components/layout/AdminShell";
import ProductDetails from "@/components/products/ProductDetails";
import { requirePageAuth } from "@/lib/auth/requireAuth";
import { getProductDetails } from "@/lib/services/productService";

type StoreProductDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BattogoProductDetailsPage({
  params
}: StoreProductDetailsPageProps) {
  const user = await requirePageAuth();
  const { id } = await params;
  const details = await getProductDetails(id);

  if (!details || details.product.store_id !== "battogo") {
    notFound();
  }

  return (
    <AdminShell user={user}>
      <ProductDetails product={details.product} messages={details.messages} />
    </AdminShell>
  );
}

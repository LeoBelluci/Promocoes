import { formatDateBR } from "@/lib/dates";
import { formatPlainBRL } from "@/lib/formatters";
import { getStoreName } from "@/lib/stores";
import type { ProductPromotion } from "@/types/product";

export function buildPromotionReminderMessage(product: ProductPromotion) {
  const storeName = getStoreName(product.store_id);

  return `Hello. The promotion for the product ${product.product_name}, SKU ${product.sku}, from the store ${storeName} on ${product.marketplace}, ends on ${formatDateBR(product.ending_date)}.

Promo code: ${product.promo_code ?? "-"}
Renewal value: R$ ${formatPlainBRL(product.renewal_value)}

Please verify the renewal before the deadline to keep the promotion active.`;
}

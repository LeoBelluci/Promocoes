import type { ProductFiltersState } from "@/types/product";

export const defaultProductFilters: ProductFiltersState = {
  search: "",
  store_id: "",
  marketplace: "",
  product_name: "",
  sku: "",
  promo_code: "",
  promotion: "",
  status: "",
  ending_date: "",
  ending_today: false,
  ending_next_3_days: false,
  expired: false
};

export function buildProductQueryString(filters: ProductFiltersState) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      if (value) {
        params.set(key, "true");
      }
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  return params.toString();
}

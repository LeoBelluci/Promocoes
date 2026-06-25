import "server-only";

import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import { defaultProductFilters } from "@/lib/productFilters";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  ProductFiltersState,
  ProductPromotion,
  ProductPromotionPayload,
  ProductStats,
  SentMessage
} from "@/types/product";

function booleanParam(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return false;
}

function textParam(searchParams: URLSearchParams, key: string) {
  return searchParams.get(key)?.trim() ?? "";
}

export function getFiltersFromSearchParams(searchParams: URLSearchParams) {
  return {
    search: textParam(searchParams, "search"),
    store_id: textParam(searchParams, "store_id"),
    marketplace: textParam(searchParams, "marketplace"),
    product_name: textParam(searchParams, "product_name"),
    sku: textParam(searchParams, "sku"),
    promo_code: textParam(searchParams, "promo_code"),
    promotion: textParam(searchParams, "promotion"),
    status: textParam(searchParams, "status"),
    ending_date: textParam(searchParams, "ending_date"),
    ending_today: booleanParam(searchParams, "ending_today"),
    ending_next_3_days: booleanParam(searchParams, "ending_next_3_days"),
    expired: booleanParam(searchParams, "expired")
  } satisfies ProductFiltersState;
}

function cleanSearchTerm(value: string) {
  return value.replace(/[,%]/g, " ").trim();
}

type ProductFilterQuery = {
  eq: (column: string, value: unknown) => ProductFilterQuery;
  gte: (column: string, value: unknown) => ProductFilterQuery;
  ilike: (column: string, pattern: string) => ProductFilterQuery;
  lt: (column: string, value: unknown) => ProductFilterQuery;
  lte: (column: string, value: unknown) => ProductFilterQuery;
  or: (filters: string) => ProductFilterQuery;
};

function applyProductFilters<Query extends ProductFilterQuery>(
  query: Query,
  filters: ProductFiltersState
) {
  let nextQuery: ProductFilterQuery = query;
  const today = getTodayDateString();

  if (filters.search) {
    const search = cleanSearchTerm(filters.search);

    if (search) {
      nextQuery = nextQuery.or(
        `product_name.ilike.%${search}%,sku.ilike.%${search}%,promo_code.ilike.%${search}%`
      );
    }
  }

  if (filters.store_id) {
    nextQuery = nextQuery.eq("store_id", filters.store_id);
  }

  if (filters.marketplace) {
    nextQuery = nextQuery.eq("marketplace", filters.marketplace);
  }

  if (filters.product_name) {
    nextQuery = nextQuery.ilike("product_name", `%${filters.product_name}%`);
  }

  if (filters.sku) {
    nextQuery = nextQuery.ilike("sku", `%${filters.sku}%`);
  }

  if (filters.promo_code) {
    nextQuery = nextQuery.ilike("promo_code", `%${filters.promo_code}%`);
  }

  if (filters.promotion === "true" || filters.promotion === "false") {
    nextQuery = nextQuery.eq("promotion", filters.promotion === "true");
  }

  if (filters.status) {
    nextQuery = nextQuery.eq("status", filters.status);
  }

  if (filters.ending_date) {
    nextQuery = nextQuery.eq("ending_date", filters.ending_date);
  }

  if (filters.ending_today) {
    nextQuery = nextQuery.eq("ending_date", today);
  }

  if (filters.ending_next_3_days) {
    nextQuery = nextQuery.gte("ending_date", today).lte("ending_date", addDaysToDateString(today, 3));
  }

  if (filters.expired) {
    nextQuery = nextQuery.lt("ending_date", today);
  }

  return nextQuery as Query;
}

export async function listProducts(filters: ProductFiltersState = defaultProductFilters) {
  const supabase = createSupabaseAdminClient();
  const query = applyProductFilters(
    supabase
      .from("product_promotions")
      .select("*")
      .order("ending_date", { ascending: true })
      .order("created_at", { ascending: false }),
    filters
  );

  const { data, error } = await query;

  if (error) {
    console.error("Failed to list products", error);
    throw new Error("Nao foi possivel carregar as promocoes.");
  }

  return (data ?? []) as ProductPromotion[];
}

export async function getProductById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_promotions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product", error);
    throw new Error("Nao foi possivel carregar a promocao.");
  }

  return data as ProductPromotion | null;
}

export async function getProductDetails(id: string) {
  const product = await getProductById(id);

  if (!product) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("sent_messages")
    .select("*")
    .eq("product_id", id)
    .order("sent_at", { ascending: false });

  if (error) {
    console.error("Failed to load product messages", error);
    throw new Error("Nao foi possivel carregar o historico de mensagens.");
  }

  return {
    product,
    messages: (data ?? []) as SentMessage[]
  };
}

export async function createProduct(payload: ProductPromotionPayload) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_promotions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este SKU ja existe para a loja selecionada.");
    }

    console.error("Failed to create product", error);
    throw new Error("Nao foi possivel criar a promocao.");
  }

  return data as ProductPromotion;
}

export async function updateProduct(id: string, payload: Partial<ProductPromotionPayload>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_promotions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este SKU ja existe para a loja selecionada.");
    }

    console.error("Failed to update product", error);
    throw new Error("Nao foi possivel atualizar a promocao.");
  }

  return data as ProductPromotion | null;
}

export async function deleteProduct(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("product_promotions")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Failed to delete product", error);
    throw new Error("Nao foi possivel excluir a promocao.");
  }

  return data as { id: string } | null;
}

async function countProducts(filters: ProductFiltersState) {
  const supabase = createSupabaseAdminClient();
  const baseQuery = supabase.from("product_promotions").select("id", {
    count: "exact",
    head: true
  });
  const query = applyProductFilters(
    baseQuery as unknown as ProductFilterQuery,
    filters
  ) as unknown as PromiseLike<{
    count: number | null;
    error: { message: string } | null;
  }>;

  const { count, error } = await query;

  if (error) {
    console.error("Failed to count products", error);
    throw new Error("Nao foi possivel carregar estatisticas.");
  }

  return count ?? 0;
}

export async function getProductStats(storeId?: string): Promise<ProductStats> {
  const base = {
    ...defaultProductFilters,
    store_id: storeId ?? ""
  };

  const [total, activePromotions, endingSoon, expired] = await Promise.all([
    countProducts(base),
    countProducts({
      ...base,
      promotion: "true",
      status: "active"
    }),
    countProducts({
      ...base,
      promotion: "true",
      status: "active",
      ending_next_3_days: true
    }),
    countProducts({
      ...base,
      expired: true
    })
  ]);

  return {
    total,
    activePromotions,
    endingSoon,
    expired
  };
}

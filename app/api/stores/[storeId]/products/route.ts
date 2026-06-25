import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import {
  getFiltersFromSearchParams,
  listProducts
} from "@/lib/services/productService";
import { storeIdSchema } from "@/lib/validations/storeIdSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type StoreRouteContext = {
  params: { storeId: string } | Promise<{ storeId: string }>;
};

async function getStoreId(context: StoreRouteContext) {
  const params = await context.params;
  return params.storeId;
}

export async function GET(request: NextRequest, context: StoreRouteContext) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const storeId = await getStoreId(context);
  const parsedStoreId = storeIdSchema.safeParse(storeId);

  if (!parsedStoreId.success) {
    return jsonError("Loja nao encontrada.", 404);
  }

  try {
    const filters = {
      ...getFiltersFromSearchParams(request.nextUrl.searchParams),
      store_id: parsedStoreId.data
    };
    const data = await listProducts(filters);

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nao foi possivel carregar as promocoes.", 500);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { jsonError, readJson, zodErrorResponse } from "@/lib/api";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import {
  createProduct,
  getFiltersFromSearchParams,
  listProducts
} from "@/lib/services/productService";
import { getStoreById } from "@/lib/stores";
import { productPromotionCreateSchema } from "@/lib/validations/productPromotionSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  try {
    const filters = getFiltersFromSearchParams(request.nextUrl.searchParams);
    const data = await listProducts(filters);

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nao foi possivel carregar as promocoes.", 500);
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const body = await readJson(request);

  if (!body) {
    return jsonError("JSON invalido.", 400);
  }

  const parsed = productPromotionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const store = getStoreById(parsed.data.store_id);

  if (!store) {
    return jsonError("Loja nao encontrada.", 422);
  }

  try {
    const data = await createProduct({
      ...parsed.data,
      marketplace: store.marketplace,
      promo_code: parsed.data.promo_code ?? null,
      image_url: parsed.data.image_url ?? null
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel criar a promocao.";
    const status = message.includes("SKU") ? 409 : 500;

    return jsonError(message, status);
  }
}

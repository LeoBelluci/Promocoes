import { NextRequest, NextResponse } from "next/server";
import { jsonError, readJson, zodErrorResponse } from "@/lib/api";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import {
  deleteProduct,
  getProductById,
  updateProduct
} from "@/lib/services/productService";
import { getStoreById } from "@/lib/stores";
import { productPromotionUpdateSchema } from "@/lib/validations/productPromotionSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProductRouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

async function getProductId(context: ProductRouteContext) {
  const params = await context.params;
  return params.id;
}

export async function GET(_request: NextRequest, context: ProductRouteContext) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const id = await getProductId(context);

  try {
    const data = await getProductById(id);

    if (!data) {
      return jsonError("Promocao nao encontrada.", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nao foi possivel carregar a promocao.", 500);
  }
}

export async function PUT(request: NextRequest, context: ProductRouteContext) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const id = await getProductId(context);
  const body = await readJson(request);

  if (!body) {
    return jsonError("JSON invalido.", 400);
  }

  const parsed = productPromotionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const payload = { ...parsed.data };

  if ("promo_code" in parsed.data) {
    payload.promo_code = parsed.data.promo_code ?? null;
  }

  if ("image_url" in parsed.data) {
    payload.image_url = parsed.data.image_url ?? null;
  }

  if (payload.store_id) {
    const store = getStoreById(payload.store_id);

    if (!store) {
      return jsonError("Loja nao encontrada.", 422);
    }

    payload.marketplace = store.marketplace;
  }

  try {
    const data = await updateProduct(id, payload);

    if (!data) {
      return jsonError("Promocao nao encontrada.", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nao foi possivel atualizar a promocao.";
    const status = message.includes("SKU") ? 409 : 500;

    return jsonError(message, status);
  }
}

export async function DELETE(_request: NextRequest, context: ProductRouteContext) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const id = await getProductId(context);

  try {
    const data = await deleteProduct(id);

    if (!data) {
      return jsonError("Promocao nao encontrada.", 404);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Nao foi possivel excluir a promocao.", 500);
  }
}

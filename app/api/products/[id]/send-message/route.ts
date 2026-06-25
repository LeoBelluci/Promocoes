import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import { sendPromotionReminder, whatsAppFailureResponse } from "@/lib/reminders";
import { getProductById } from "@/lib/services/productService";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type ProductRouteContext = {
  params: { id: string } | Promise<{ id: string }>;
};

async function getProductId(context: ProductRouteContext) {
  const params = await context.params;
  return params.id;
}

export async function POST(_request: NextRequest, context: ProductRouteContext) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const id = await getProductId(context);

  try {
    const product = await getProductById(id);

    if (!product) {
      return jsonError("Promocao nao encontrada.", 404);
    }

    const result = await sendPromotionReminder(product, "manual");

    return NextResponse.json({
      data: result.sentMessages,
      message: result.message
    });
  } catch (sendError) {
    return whatsAppFailureResponse(sendError);
  }
}

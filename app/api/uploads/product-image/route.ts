import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import { PRODUCT_IMAGE_BUCKET } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isValidStoreId } from "@/lib/stores";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function sanitizeFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const storeId = String(formData.get("store_id") ?? "");

  if (!isValidStoreId(storeId)) {
    return jsonError("Loja invalida para upload.", 422);
  }

  if (!(file instanceof File)) {
    return jsonError("Arquivo nao enviado.", 400);
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return jsonError("Formato de imagem nao permitido.", 422);
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("A imagem deve ter no maximo 5MB.", 422);
  }

  const supabase = createSupabaseAdminClient();
  const fileName = sanitizeFileName(file.name) || "produto";
  const filePath = `${storeId}/${crypto.randomUUID()}-${fileName}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGE_BUCKET)
    .upload(filePath, await file.arrayBuffer(), {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false
    });

  if (error) {
    console.error("Product image upload failed", error);
    return jsonError("Nao foi possivel enviar a imagem.", 500);
  }

  const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);

  return NextResponse.json({ url: data.publicUrl, path: filePath });
}

import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/auth/requireAuth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const auth = await requireApiAuth();

  if (auth.response) {
    return auth.response;
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("product_promotions").select("id").limit(1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase connection error.";

    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { addDaysToDateString, getTodayDateString } from "@/lib/dates";
import {
  hasReminderForToday,
  sendPromotionReminder
} from "@/lib/reminders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ProductPromotion } from "@/types/product";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const querySecret = request.nextUrl.searchParams.get("secret");

  return authorization === `Bearer ${cronSecret}` || querySecret === cronSecret;
}

async function runCron(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    return jsonError("CRON_SECRET nao configurado.", 500);
  }

  if (!isAuthorized(request)) {
    return jsonError("Nao autorizado.", 401);
  }

  const supabase = createSupabaseAdminClient();
  const today = getTodayDateString();
  const limitDate = addDaysToDateString(today, 3);

  const { data: products, error } = await supabase
    .from("product_promotions")
    .select("*")
    .eq("promotion", true)
    .eq("status", "active")
    .gte("ending_date", today)
    .lte("ending_date", limitDate)
    .order("ending_date", { ascending: true });

  if (error) {
    console.error("Cron product lookup failed", error);
    return jsonError("Nao foi possivel buscar promocoes proximas do fim.", 500);
  }

  const summary = {
    checkedProducts: products?.length ?? 0,
    sentMessages: 0,
    skippedDuplicates: 0,
    errors: 0,
    failures: [] as Array<{ product_id: string; error: string }>
  };

  for (const product of (products ?? []) as ProductPromotion[]) {
    try {
      const alreadySent = await hasReminderForToday(product.id);

      if (alreadySent) {
        summary.skippedDuplicates += 1;
        continue;
      }

      const result = await sendPromotionReminder(product, "automatic");
      summary.sentMessages += result.sentMessages.length;
    } catch (sendError) {
      summary.errors += 1;
      console.error("Cron reminder failed", sendError);
      summary.failures.push({
        product_id: product.id,
        error: "Falha ao enviar lembrete."
      });
    }
  }

  return NextResponse.json({
    data: summary,
    window: {
      from: today,
      to: limitDate
    }
  });
}

export async function POST(request: NextRequest) {
  return runCron(request);
}

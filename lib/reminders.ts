import "server-only";

import { jsonError } from "@/lib/api";
import { getDateRangeForLocalDay, getTodayDateString } from "@/lib/dates";
import { buildPromotionReminderMessage } from "@/lib/messages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getReminderWhatsAppRecipients } from "@/lib/whatsappConfig";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import type { ProductPromotion, SentMessage } from "@/types/product";

export type ReminderTriggerType = "manual" | "automatic";

export async function sendPromotionReminder(
  product: ProductPromotion,
  triggerType: ReminderTriggerType = "manual"
) {
  const supabase = createSupabaseAdminClient();
  const message = buildPromotionReminderMessage(product);
  const sentMessages: SentMessage[] = [];

  for (const recipient of getReminderWhatsAppRecipients()) {
    const providerResult = await sendWhatsAppMessage({
      to: recipient,
      body: message
    });

    const { data, error } = await supabase
      .from("sent_messages")
      .insert({
        product_id: product.id,
        store_id: product.store_id,
        marketplace: product.marketplace,
        phone_number: recipient,
        message,
        provider: providerResult.provider,
        provider_message_id: providerResult.providerMessageId,
        status: providerResult.status,
        trigger_type: triggerType
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Mensagem enviada, mas nao foi possivel salvar o log: ${error.message}`);
    }

    sentMessages.push(data as SentMessage);
  }

  return {
    message,
    sentMessages
  };
}

export async function hasReminderForToday(productId: string) {
  const supabase = createSupabaseAdminClient();
  const today = getTodayDateString();
  const range = getDateRangeForLocalDay(today);

  const recipients = getReminderWhatsAppRecipients();
  const { count, error } = await supabase
    .from("sent_messages")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId)
    .in("phone_number", recipients)
    .gte("sent_at", range.start)
    .lt("sent_at", range.end);

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) >= recipients.length;
}

export function whatsAppFailureResponse(error: unknown) {
  console.error("WhatsApp reminder failed", error);
  return jsonError("Nao foi possivel enviar a mensagem pelo WhatsApp.", 502);
}

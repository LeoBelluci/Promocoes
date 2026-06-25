"use client";

import { Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";

interface SendMessageButtonProps {
  productId: string;
  disabled?: boolean;
  onResult?: (type: "success" | "error", message: string) => void;
}

export default function SendMessageButton({
  productId,
  disabled = false,
  onResult
}: SendMessageButtonProps) {
  const [sending, setSending] = useState(false);

  async function handleSend() {
    setSending(true);

    try {
      const response = await fetch(`/api/products/${productId}/send-message`, {
        method: "POST"
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel enviar a mensagem.");
      }

      onResult?.("success", "Mensagem enviada para os WhatsApps configurados.");
    } catch (error) {
      onResult?.(
        "error",
        error instanceof Error ? error.message : "Nao foi possivel enviar a mensagem."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || sending}
      onClick={handleSend}
      title="Enviar lembrete pelo WhatsApp"
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
    >
      {sending ? (
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
      ) : (
        <MessageCircle aria-hidden="true" className="h-4 w-4" />
      )}
      <span className="sr-only">Enviar mensagem</span>
    </button>
  );
}

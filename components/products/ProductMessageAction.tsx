"use client";

import SendMessageButton from "@/components/SendMessageButton";
import { useToast } from "@/components/ui/ToastProvider";

export default function ProductMessageAction({ productId }: { productId: string }) {
  const { showToast } = useToast();

  return <SendMessageButton productId={productId} onResult={showToast} />;
}

import { z } from "zod";

export const sendMessageSchema = z.object({
  product_id: z.string().uuid("Produto invalido.").optional()
});

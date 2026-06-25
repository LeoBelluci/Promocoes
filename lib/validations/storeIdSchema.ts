import { z } from "zod";
import { isValidStoreId } from "@/lib/stores";

export const storeIdSchema = z.string().trim().superRefine((storeId, ctx) => {
  if (!isValidStoreId(storeId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Loja nao encontrada."
    });
  }
});

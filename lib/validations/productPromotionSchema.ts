import { z } from "zod";
import { isValidStoreId } from "@/lib/stores";
import { promotionStatuses } from "@/types/product";

const emptyToNull = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

function isValidDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function hasValidWhatsAppDigits(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

const productPromotionBaseSchema = z.object({
    store_id: z.string().trim().min(1, "Selecione uma loja."),
    marketplace: z.string().trim().min(1, "Marketplace e obrigatorio.").default("Mercado Livre"),
    product_name: z.string().trim().min(1, "Nome do produto e obrigatorio."),
    sku: z.string().trim().min(1, "SKU e obrigatorio."),
    promotion: z.coerce.boolean().default(true),
    ending_date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data valida.")
      .refine(isValidDateString, "Informe uma data valida."),
    promo_code: z
      .string()
      .optional()
      .nullable()
      .transform(emptyToNull),
    image_url: z
      .union([z.string().trim().url("URL da imagem invalida."), z.literal("")])
      .optional()
      .nullable()
      .transform(emptyToNull),
    phone_number: z
      .string()
      .trim()
      .min(8, "Telefone e obrigatorio.")
      .refine(hasValidWhatsAppDigits, "Informe um telefone valido para WhatsApp."),
    renewal_value: z.coerce
      .number()
      .positive("Valor de renovacao deve ser positivo."),
    status: z.enum(promotionStatuses)
});

export const productPromotionSchema = productPromotionBaseSchema.superRefine((data, ctx) => {
    if (!isValidStoreId(data.store_id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["store_id"],
        message: "Loja selecionada nao esta configurada."
      });
    }
  });

export const productPromotionCreateSchema = productPromotionSchema;
export const productPromotionUpdateSchema = productPromotionBaseSchema.partial().superRefine((data, ctx) => {
  if (data.store_id && !isValidStoreId(data.store_id)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["store_id"],
      message: "Loja selecionada nao esta configurada."
    });
  }
});

export type ProductPromotionFormInput = z.input<typeof productPromotionSchema>;
export type ProductPromotionFormValues = z.output<typeof productPromotionSchema>;

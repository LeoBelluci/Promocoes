"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";
import StoreSelector from "@/components/StoreSelector";
import { useToast } from "@/components/ui/ToastProvider";
import { getStoreById, type StoreId } from "@/lib/stores";
import {
  productPromotionSchema,
  type ProductPromotionFormInput,
  type ProductPromotionFormValues
} from "@/lib/validations/productPromotionSchema";
import { promotionStatuses, type ProductPromotion } from "@/types/product";

interface ProductFormProps {
  mode: "create" | "edit";
  initialData?: ProductPromotion;
  initialStoreId?: string;
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  expired: "Expirado",
  renewed: "Renovado",
  inactive: "Inativo"
};

function fieldClass(hasError?: boolean) {
  return [
    "h-11 w-full rounded-md border bg-white px-3 text-sm outline-none transition",
    hasError
      ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
      : "border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-100"
  ].join(" ");
}

export default function ProductForm({ mode, initialData, initialStoreId }: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const defaultStore = initialData?.store_id ?? initialStoreId ?? "";
  const defaultStoreConfig = getStoreById(defaultStore);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ProductPromotionFormInput, unknown, ProductPromotionFormValues>({
    resolver: zodResolver(productPromotionSchema),
    defaultValues: {
      store_id: defaultStore,
      marketplace: initialData?.marketplace ?? defaultStoreConfig?.marketplace ?? "Mercado Livre",
      product_name: initialData?.product_name ?? "",
      sku: initialData?.sku ?? "",
      promotion: initialData?.promotion ?? true,
      ending_date: initialData?.ending_date ?? "",
      promo_code: initialData?.promo_code ?? "",
      image_url: initialData?.image_url ?? "",
      phone_number: initialData?.phone_number ?? "",
      renewal_value: Number(initialData?.renewal_value ?? 0),
      status: initialData?.status ?? "active"
    }
  });

  const selectedStore = watch("store_id");
  const imageUrl = watch("image_url");

  async function onSubmit(values: ProductPromotionFormValues) {
    setSubmitError(null);
    setSaved(false);

    const endpoint =
      mode === "edit" && initialData ? `/api/products/${initialData.id}` : "/api/products";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? "Nao foi possivel salvar a promocao.");
      }

      setSaved(true);
      showToast("success", mode === "edit" ? "Promocao atualizada." : "Promocao criada.");

      const product = payload?.data as ProductPromotion | undefined;
      const store = getStoreById(product?.store_id ?? values.store_id);
      const nextPath = product?.id && store
        ? `${store.route}/products/${product.id}`
        : store?.route ?? "/dashboard";

      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel salvar a promocao.";
      setSubmitError(message);
      showToast("error", message);
    }
  }

  function handleStoreChange(storeId: StoreId) {
    const store = getStoreById(storeId);
    setValue("store_id", storeId, { shouldDirty: true, shouldValidate: true });
    setValue("marketplace", store?.marketplace ?? "Mercado Livre", {
      shouldDirty: true,
      shouldValidate: true
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            {mode === "edit" ? "Editar promocao" : "Nova promocao"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Selecione a loja, preencha os dados comerciais e salve a promocao.
          </p>
        </div>

        <Link
          href={selectedStore ? getStoreById(selectedStore)?.route ?? "/dashboard" : "/dashboard"}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:border-yellow-300 hover:bg-yellow-50"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Loja</h2>
        <div className="mt-3">
          <StoreSelector selectedStore={selectedStore ?? ""} onChange={handleStoreChange} />
        </div>
        {errors.store_id ? (
          <p className="mt-2 text-sm text-rose-600">{errors.store_id.message}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Nome do produto</span>
            <input
              {...register("product_name")}
              className={fieldClass(Boolean(errors.product_name))}
              placeholder="Ex: Fone Bluetooth"
            />
            {errors.product_name ? (
              <span className="block text-sm text-rose-600">{errors.product_name.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">SKU</span>
            <input
              {...register("sku")}
              className={fieldClass(Boolean(errors.sku))}
              placeholder="SKU interno"
            />
            {errors.sku ? (
              <span className="block text-sm text-rose-600">{errors.sku.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Data final</span>
            <input
              type="date"
              {...register("ending_date")}
              className={fieldClass(Boolean(errors.ending_date))}
            />
            {errors.ending_date ? (
              <span className="block text-sm text-rose-600">{errors.ending_date.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Codigo promocional</span>
            <input
              {...register("promo_code")}
              className={fieldClass(Boolean(errors.promo_code))}
              placeholder="Opcional"
            />
            {errors.promo_code ? (
              <span className="block text-sm text-rose-600">{errors.promo_code.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Telefone WhatsApp</span>
            <input
              {...register("phone_number")}
              className={fieldClass(Boolean(errors.phone_number))}
              placeholder="+5511999999999"
            />
            {errors.phone_number ? (
              <span className="block text-sm text-rose-600">{errors.phone_number.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Valor de renovacao</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("renewal_value", { valueAsNumber: true })}
              className={fieldClass(Boolean(errors.renewal_value))}
              placeholder="0,00"
            />
            {errors.renewal_value ? (
              <span className="block text-sm text-rose-600">{errors.renewal_value.message}</span>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-sm font-semibold text-slate-700">Status</span>
            <select
              {...register("status")}
              className={fieldClass(Boolean(errors.status))}
            >
              {promotionStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
            {errors.status ? (
              <span className="block text-sm text-rose-600">{errors.status.message}</span>
            ) : null}
          </label>

          <label className="flex h-11 items-center gap-3 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              {...register("promotion")}
              className="h-4 w-4 rounded border-slate-300 text-yellow-500 focus:ring-yellow-300"
            />
            Promocao ativa
          </label>

          <input type="hidden" {...register("marketplace")} />
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Imagem do produto</h2>
        <div className="mt-3">
          <ImageUpload
            value={imageUrl ?? ""}
            storeId={selectedStore ?? ""}
            disabled={isSubmitting}
            onChange={(url) =>
              setValue("image_url", url ?? "", {
                shouldDirty: true,
                shouldValidate: true
              })
            }
          />
        </div>
        {errors.image_url ? (
          <p className="mt-2 text-sm text-rose-600">{errors.image_url.message}</p>
        ) : null}
      </section>

      {submitError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {submitError}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Promocao salva com sucesso.
        </div>
      ) : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="h-4 w-4" />
          )}
          {isSubmitting ? "Salvando" : "Salvar promocao"}
        </button>
      </div>
    </form>
  );
}

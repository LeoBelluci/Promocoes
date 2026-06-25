import type { PromotionStatus } from "@/types/product";

const statusStyles: Record<PromotionStatus, string> = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  expired: "border-rose-200 bg-rose-50 text-rose-700",
  renewed: "border-blue-200 bg-blue-50 text-blue-700",
  inactive: "border-slate-200 bg-slate-100 text-slate-600"
};

const statusLabels: Record<PromotionStatus, string> = {
  active: "Ativo",
  expired: "Expirado",
  renewed: "Renovado",
  inactive: "Inativo"
};

interface StatusBadgeProps {
  status: PromotionStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-w-20 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

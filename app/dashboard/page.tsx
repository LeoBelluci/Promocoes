import AdminShell from "@/components/layout/AdminShell";
import Dashboard from "@/components/Dashboard";
import { requirePageAuth } from "@/lib/auth/requireAuth";
import {
  getFiltersFromSearchParams,
  getProductStats
} from "@/lib/services/productService";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toUrlSearchParams(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => searchParams.append(key, entry));
      return;
    }

    if (value) {
      searchParams.set(key, value);
    }
  });

  return searchParams;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const user = await requirePageAuth();
  const params = await searchParams;
  const [stats] = await Promise.all([getProductStats()]);
  const initialFilters = getFiltersFromSearchParams(toUrlSearchParams(params));

  return (
    <AdminShell user={user}>
      <Dashboard initialFilters={initialFilters} stats={stats} />
    </AdminShell>
  );
}

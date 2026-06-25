import AdminShell from "@/components/layout/AdminShell";
import BononiAcessoriosStore from "@/components/stores/BononiAcessoriosStore";
import { requirePageAuth } from "@/lib/auth/requireAuth";

export default async function BononiAcessoriosPage() {
  const user = await requirePageAuth();

  return (
    <AdminShell user={user}>
      <BononiAcessoriosStore />
    </AdminShell>
  );
}

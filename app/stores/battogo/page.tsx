import AdminShell from "@/components/layout/AdminShell";
import BattogoStore from "@/components/stores/BattogoStore";
import { requirePageAuth } from "@/lib/auth/requireAuth";

export default async function BattogoPage() {
  const user = await requirePageAuth();

  return (
    <AdminShell user={user}>
      <BattogoStore />
    </AdminShell>
  );
}

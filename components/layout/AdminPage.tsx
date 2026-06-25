import type { ReactNode } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { requirePageAuth } from "@/lib/auth/requireAuth";

export default async function AdminPage({ children }: { children: ReactNode }) {
  const user = await requirePageAuth();

  return <AdminShell user={user}>{children}</AdminShell>;
}

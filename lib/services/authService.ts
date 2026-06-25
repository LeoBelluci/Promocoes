import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminUserRecord, UserRole } from "@/types/auth";

export async function getAdminUserByEmail(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("id,name,email,password_hash,role,created_at,updated_at")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Failed to load admin user", error);
    throw new Error("Nao foi possivel validar o usuario.");
  }

  return data as AdminUserRecord | null;
}

export async function createAdminUser({
  name,
  email,
  passwordHash,
  role = "admin"
}: {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("admin_users")
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash: passwordHash,
      role
    })
    .select("id,name,email,role,created_at,updated_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este email ja esta cadastrado.");
    }

    console.error("Failed to create admin user", error);
    throw new Error("Nao foi possivel criar o usuario.");
  }

  return data as Omit<AdminUserRecord, "password_hash">;
}

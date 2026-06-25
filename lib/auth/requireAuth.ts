import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jsonError } from "@/lib/api";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifySessionToken } from "@/lib/auth/session";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getCurrentUser() {
  return (await getCurrentSession())?.user ?? null;
}

export async function requirePageAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireApiAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: jsonError("Nao autorizado.", 401)
    } as const;
  }

  return {
    user,
    response: null
  } as const;
}

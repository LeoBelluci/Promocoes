import { NextRequest, NextResponse } from "next/server";
import { jsonError, readJson, zodErrorResponse } from "@/lib/api";
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { getAdminUserByEmail } from "@/lib/services/authService";
import { loginSchema } from "@/lib/validations/loginSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await readJson(request);

  if (!body) {
    return jsonError("JSON invalido.", 400);
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    const user = await getAdminUserByEmail(parsed.data.email);
    const validPassword = user
      ? await verifyPassword(parsed.data.password, user.password_hash)
      : false;

    if (!user || !validPassword) {
      return jsonError("Email ou senha invalidos.", 401);
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    response.cookies.set(
      SESSION_COOKIE_NAME,
      createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }),
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return jsonError("Nao foi possivel entrar agora.", 500);
  }
}

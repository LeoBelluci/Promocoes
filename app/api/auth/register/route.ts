import { NextRequest, NextResponse } from "next/server";
import { jsonError, readJson, zodErrorResponse } from "@/lib/api";
import { getSessionCookieOptions, SESSION_COOKIE_NAME } from "@/lib/auth/cookies";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken } from "@/lib/auth/session";
import { createAdminUser } from "@/lib/services/authService";
import { registerSchema } from "@/lib/validations/registerSchema";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getRegistrationCode() {
  const code = process.env.REGISTRATION_CODE;

  if (!code) {
    throw new Error("REGISTRATION_CODE nao configurado.");
  }

  return code;
}

export async function POST(request: NextRequest) {
  const body = await readJson(request);

  if (!body) {
    return jsonError("JSON invalido.", 400);
  }

  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  try {
    if (parsed.data.registrationCode !== getRegistrationCode()) {
      return jsonError("Codigo de cadastro invalido.", 401);
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createAdminUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "admin"
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }, { status: 201 });

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
    const message = error instanceof Error ? error.message : "Nao foi possivel criar o usuario.";
    const status = message.includes("email") ? 409 : 500;

    return jsonError(message, status);
  }
}

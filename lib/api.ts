import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(message: string, status: number, details?: unknown) {
  return NextResponse.json(
    {
      error: message,
      details
    },
    { status }
  );
}

export function zodErrorResponse(error: ZodError) {
  return jsonError(
    "Dados invalidos.",
    422,
    error.flatten()
  );
}

export async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

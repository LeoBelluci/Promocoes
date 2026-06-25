import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthUser } from "@/types/auth";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/auth/cookies";

interface SessionPayload {
  user: AuthUser;
  iat: number;
  exp: number;
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters.");
  }

  return secret;
}

function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function signaturesMatch(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function createSessionToken(user: AuthUser) {
  const now = Math.floor(Date.now() / 1000);
  const payload = encodePayload({
    user,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS
  });

  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature || !signaturesMatch(sign(payload), signature)) {
    return null;
  }

  try {
    const session = decodePayload(payload);
    const now = Math.floor(Date.now() / 1000);

    if (!session.user?.id || !session.user.email || session.exp <= now) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

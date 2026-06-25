export const SESSION_COOKIE_NAME = "promocoes_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

export function getSessionCookieOptions(): SessionCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export function getExpiredSessionCookieOptions(): SessionCookieOptions {
  return {
    ...getSessionCookieOptions(),
    maxAge: 0
  };
}

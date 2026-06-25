import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/cookies";

const publicPagePaths = ["/login", "/register"];
const publicApiPrefixes = ["/api/auth/login", "/api/auth/register", "/api/cron"];
const protectedApiPrefixes = ["/api/products", "/api/stores", "/api/test-supabase", "/api/uploads"];

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/favicon") ||
    Boolean(pathname.match(/\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/))
  );
}

function hasSessionCookie(request: NextRequest) {
  return Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || publicApiPrefixes.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (publicPagePaths.includes(pathname)) {
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (protectedApiPrefixes.some((path) => pathname.startsWith(path)) && !hasSessionCookie(request)) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  if (!pathname.startsWith("/api") && !hasSessionCookie(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"]
};

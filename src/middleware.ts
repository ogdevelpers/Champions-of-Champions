import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, parseSessionValue } from "@/lib/auth";

const protectedPaths = ["/dashboard", "/games"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);
  const session = sessionCookie?.value ? parseSessionValue(sessionCookie.value) : null;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/games") && session && !session.canPlayGames) {
    const dashboardUrl = new URL("/dashboard", request.url);
    dashboardUrl.searchParams.set("ineligible", "1");
    return NextResponse.redirect(dashboardUrl);
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/games/:path*", "/login"],
};

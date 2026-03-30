import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PROTECTED = ["/dashboard", "/onboarding", "/messages", "/post-project", "/auditions/manage", "/hiring"];
const AUTH_ONLY = ["/login", "/register"];
const ADMIN_ROUTES = ["/admin"];

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "cineconnect_super_secret_jwt_key_2024"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthOnly = AUTH_ONLY.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_ROUTES.some((p) => pathname.startsWith(p));

  let valid = false;
  let payload: { id?: string; role?: string } = {};
  if (token) {
    try {
      const result = await jwtVerify(token, secret);
      payload = result.payload as { id?: string; role?: string };
      valid = true;
    } catch {
      valid = false;
    }
  }

  if ((isProtected || isAdmin) && !valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthOnly && valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/messages/:path*",
    "/post-project/:path*",
    "/hiring/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect /admin and anything under it
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const session = req.cookies.get("pp_admin")?.value;

    if (session !== "active") {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
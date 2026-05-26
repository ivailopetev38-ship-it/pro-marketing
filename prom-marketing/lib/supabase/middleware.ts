import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/session";

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone();
  const isAdminRoute = url.pathname.startsWith("/admin");
  const isLoginPage = url.pathname === "/admin/login";
  const isAuthApi = url.pathname === "/api/admin/auth";

  if (!isAdminRoute || isLoginPage || isAuthApi) {
    return NextResponse.next({ request });
  }

  const token = request.cookies.get(ADMIN_COOKIE)?.value ?? null;
  if (!verifySession(token)) {
    url.pathname = "/admin/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

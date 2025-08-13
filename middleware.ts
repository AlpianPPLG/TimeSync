import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/register", "/"]

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("attendance_token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const user = verifyToken(token)
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (pathname.startsWith("/manager") && !["admin", "manager"].includes(user.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

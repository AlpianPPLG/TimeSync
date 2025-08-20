import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

// Public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/"]
const apiAuthRoutes = ["/api/auth/login", "/api/auth/register"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API auth routes and public routes
  if (publicRoutes.includes(pathname) || apiAuthRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for authentication token in headers or cookies
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
               request.cookies.get("attendance_token")?.value

  // Redirect to login if no token is found
  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      )
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verify token
  const user = verifyToken(token)
  
  // Handle invalid or expired token
  if (!user) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      )
    }
    
    // Clear invalid token from cookies
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("attendance_token")
    return response
  }

  // Role-based access control
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  if (pathname.startsWith("/manager") && !["admin", "manager"].includes(user.role)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { success: false, message: "Insufficient permissions" },
        { status: 403 }
      )
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  // For API routes, add user info to request headers
  if (pathname.startsWith("/api")) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set("x-user-id", user.id.toString())
    requestHeaders.set("x-user-role", user.role)
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}

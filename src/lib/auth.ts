import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface JWTPayload {
  userId: string | null
  id: number
  employee_id: string
  role: string
  name: string
  email: string
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "attendance-secret-key") as JWTPayload
    return decoded
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function requireAuth(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null

  return verifyToken(token)
}

export function requireRole(user: JWTPayload | null, allowedRoles: string[]): boolean {
  if (!user) return false
  return allowedRoles.includes(user.role)
}

import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

// JWT Configuration
export const JWT_SECRET = process.env.JWT_SECRET || "attendance-secret-key"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

if (process.env.NODE_ENV === 'production' && JWT_SECRET === "attendance-secret-key") {
  console.warn('WARNING: Using default JWT secret in production. Please set JWT_SECRET environment variable.')
}

export interface JWTPayload {
  id: number
  employee_id: string
  role: string
  name: string
  email: string
  iat?: number
  exp?: number
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.error('Token expired at:', error.expiredAt);
      // We still return null for expired tokens, but we've logged the exact expiry time
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid token:', error.message);
    } else {
      console.error('Token verification failed:', error);
    }
    return null;
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

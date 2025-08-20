import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import jwt from "jsonwebtoken"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "No token provided" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      )
    }

    // Create a new token with the same payload but new expiration
    const newToken = jwt.sign(
      {
        id: decoded.id,
        employee_id: decoded.employee_id,
        role: decoded.role,
        name: decoded.name,
        email: decoded.email,
      },
      process.env.JWT_SECRET || "attendance-secret-key",
      { expiresIn: "24h" }
    )

    return NextResponse.json({
      success: true,
      token: newToken,
    })
  } catch (error) {
    console.error("Token refresh error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to refresh token" },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"

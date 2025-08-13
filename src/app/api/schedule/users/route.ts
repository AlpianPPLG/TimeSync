import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 })
    }

    // Get all users for admin to manage schedules
    const [users] = await pool.execute(
      `SELECT id, employee_id, name, department, position 
       FROM users 
       WHERE is_active = TRUE 
       ORDER BY name`,
    )

    return NextResponse.json({
      success: true,
      data: users,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 })
  }
}

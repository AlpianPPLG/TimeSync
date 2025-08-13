/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const offset = (page - 1) * limit

    let whereClause = "WHERE a.user_id = ?"
    const queryParams: any[] = [user.id]

    if (month && year) {
      whereClause += " AND MONTH(a.date) = ? AND YEAR(a.date) = ?"
      queryParams.push(Number.parseInt(month), Number.parseInt(year))
    }

    // Get attendance records with user info
    const [rows]: any = await pool.query(
      `SELECT 
        a.*,
        u.name as user_name,
        u.employee_id
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       ${whereClause}
       ORDER BY a.date DESC, a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    // Get total count
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM attendance a ${whereClause}`,
      queryParams,
    )

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error("Attendance history error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

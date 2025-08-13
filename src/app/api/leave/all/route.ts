/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin", "manager"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    if (status && status !== "all") {
      whereClause += " AND lr.status = ?"
      queryParams.push(status)
    }

    // Get all leave requests with user and approver info
    const [rows]: any = await pool.query(
      `SELECT 
        lr.*,
        u.name as user_name,
        u.employee_id,
        u.department,
        approver.name as approved_by_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       LEFT JOIN users approver ON lr.approved_by = approver.id
       ${whereClause}
       ORDER BY lr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    // Get total count
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM leave_requests lr ${whereClause}`,
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
    console.error("All leave requests fetch error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

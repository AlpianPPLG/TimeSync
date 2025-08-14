import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import pool from "@/lib/db"
import { JWT_SECRET } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      
      if (payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Akses ditolak. Hanya admin yang diizinkan." },
          { status: 403 }
        )
      }
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau kadaluarsa" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""
    const leave_type = searchParams.get("leave_type") || ""

    const offset = (page - 1) * limit

    // Build WHERE clause
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    if (search) {
      whereConditions.push(`(u.name LIKE ? OR u.employee_id LIKE ?)`)
      queryParams.push(`%${search}%`, `%${search}%`)
      paramIndex += 2
    }

    if (status && status !== "all") {
      whereConditions.push(`lr.status = ?`)
      queryParams.push(status)
      paramIndex++
    }

    if (leave_type && leave_type !== "all") {
      whereConditions.push(`lr.leave_type = ?`)
      queryParams.push(leave_type)
      paramIndex++
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : ""

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      ${whereClause}
    `

    const [countResult] = await pool.execute(countQuery, queryParams)
    const total = (countResult as any)[0].total
    const totalPages = Math.ceil(total / limit)

    // Get leave requests with user info
    const query = `
      SELECT 
        lr.*,
        u.name as user_name,
        u.employee_id,
        approver.name as approved_by_name
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN users approver ON lr.approved_by = approver.id
      ${whereClause}
      ORDER BY lr.created_at DESC
      LIMIT ? OFFSET ?
    `

    const [rows] = await pool.execute(query, [...queryParams, limit, offset])

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
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

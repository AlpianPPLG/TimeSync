/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const department = searchParams.get("department") || ""
    const role = searchParams.get("role") || ""
    const offset = (page - 1) * limit

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    if (search) {
      whereClause += " AND (u.name LIKE ? OR u.email LIKE ? OR u.employee_id LIKE ?)"
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
    }

    if (department) {
      whereClause += " AND u.department = ?"
      queryParams.push(department)
    }

    if (role) {
      whereClause += " AND u.role = ?"
      queryParams.push(role)
    }

    // Get users with attendance stats
    const [rows]: any = await pool.query(
      `SELECT 
        u.*,
        COUNT(a.id) as total_attendance,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count
       FROM users u
       LEFT JOIN attendance a ON u.id = a.user_id AND MONTH(a.date) = MONTH(CURRENT_DATE()) AND YEAR(a.date) = YEAR(CURRENT_DATE())
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset],
    )

    // Get total count
    const [countResult]: any = await pool.query(`SELECT COUNT(*) as total FROM users u ${whereClause}`, queryParams)

    const total = countResult[0].total
    const totalPages = Math.ceil(total / limit)

    // Remove passwords from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const usersWithoutPasswords = rows.map(({ password, ...user }: any) => user)

    return NextResponse.json({
      success: true,
      data: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error: any) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { employee_id, name, email, password, role, department, position, phone, address } = await request.json()

    // Validate required fields
    if (!employee_id || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Employee ID, nama, email, dan password wajib diisi" },
        { status: 400 },
      )
    }

    // Check if email or employee_id already exists
    const [existingUser]: any = await pool.query("SELECT id FROM users WHERE email = ? OR employee_id = ? LIMIT 1", [
      email,
      employee_id,
    ])

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: "Email atau Employee ID sudah terdaftar" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user
    const [result]: any = await pool.query(
      `INSERT INTO users (employee_id, name, email, password, role, department, position, phone, address, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [employee_id, name, email, hashedPassword, role || "employee", department, position, phone, address],
    )

    return NextResponse.json({
      success: true,
      message: "User berhasil ditambahkan",
      user_id: result.insertId,
    })
  } catch (error: any) {
    console.error("Admin create user error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

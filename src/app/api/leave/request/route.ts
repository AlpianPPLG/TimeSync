/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { differenceInDays, parseISO } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { leave_type, start_date, end_date, reason } = await request.json()

    // Validate required fields
    if (!leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json({ success: false, message: "Semua field wajib diisi" }, { status: 400 })
    }

    // Calculate days requested
    const startDate = parseISO(start_date)
    const endDate = parseISO(end_date)
    const days_requested = differenceInDays(endDate, startDate) + 1

    if (days_requested <= 0) {
      return NextResponse.json(
        { success: false, message: "Tanggal akhir harus setelah tanggal mulai" },
        { status: 400 },
      )
    }

    // Check for overlapping leave requests
    const [overlapping]: any = await pool.query(
      `SELECT id FROM leave_requests 
       WHERE user_id = ? AND status != 'rejected' 
       AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))`,
      [user.id, start_date, start_date, end_date, end_date],
    )

    if (overlapping.length > 0) {
      return NextResponse.json(
        { success: false, message: "Sudah ada pengajuan cuti pada periode tersebut" },
        { status: 400 },
      )
    }

    // Insert leave request
    const [result]: any = await pool.query(
      `INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, days_requested, reason) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user.id, leave_type, start_date, end_date, days_requested, reason],
    )

    return NextResponse.json({
      success: true,
      message: "Pengajuan cuti berhasil disubmit",
      data: {
        id: result.insertId,
        days_requested,
      },
    })
  } catch (error: any) {
    console.error("Leave request error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    let whereClause = "WHERE lr.user_id = ?"
    const queryParams: any[] = [user.id]

    if (status && status !== "all") {
      whereClause += " AND lr.status = ?"
      queryParams.push(status)
    }

    // Get leave requests with approver info
    const [rows]: any = await pool.query(
      `SELECT 
        lr.*,
        u.name as user_name,
        u.employee_id,
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
    console.error("Leave requests fetch error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

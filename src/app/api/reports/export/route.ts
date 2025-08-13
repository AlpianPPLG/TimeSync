/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { reportType, startDate, endDate, userId, department, format } = await request.json()

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    if (startDate && endDate) {
      whereClause += " AND a.date BETWEEN ? AND ?"
      queryParams.push(startDate, endDate)
    }

    if (userId && user.role === "admin") {
      whereClause += " AND a.user_id = ?"
      queryParams.push(userId)
    } else if (user.role !== "admin") {
      whereClause += " AND a.user_id = ?"
      queryParams.push(user.id)
    }

    if (department && user.role === "admin") {
      whereClause += " AND u.department = ?"
      queryParams.push(department)
    }

    let data: any[] = []

    if (reportType === "attendance") {
      const [rows]: any = await pool.query(
        `SELECT 
          u.employee_id,
          u.name,
          u.department,
          a.date,
          a.check_in_time,
          a.check_out_time,
          a.total_hours,
          a.status,
          a.location,
          a.notes
         FROM attendance a
         JOIN users u ON a.user_id = u.id
         ${whereClause}
         ORDER BY a.date DESC, u.name`,
        queryParams,
      )
      data = rows
    } else if (reportType === "leave") {
      const [rows]: any = await pool.query(
        `SELECT 
          u.employee_id,
          u.name,
          u.department,
          lr.leave_type,
          lr.start_date,
          lr.end_date,
          lr.days_requested,
          lr.reason,
          lr.status,
          approver.name as approved_by_name,
          lr.approved_at,
          lr.rejection_reason
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         LEFT JOIN users approver ON lr.approved_by = approver.id
         ${whereClause.replace("a.", "lr.")}
         ORDER BY lr.created_at DESC`,
        queryParams,
      )
      data = rows
    }

    if (format === "csv") {
      // Generate CSV
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(","),
        ...data.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${reportType}_report_${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    // Return JSON data for client-side processing
    return NextResponse.json({
      success: true,
      data,
      filename: `${reportType}_report_${new Date().toISOString().split("T")[0]}`,
    })
  } catch (error: any) {
    console.error("Export report error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

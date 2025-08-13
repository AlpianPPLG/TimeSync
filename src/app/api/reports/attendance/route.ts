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
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")
    const userId = searchParams.get("user_id")
    const department = searchParams.get("department")
    const reportType = searchParams.get("type") || "summary"

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

    if (reportType === "summary") {
      // Get attendance summary
      const [summaryData]: any = await pool.query(
        `SELECT 
          COUNT(*) as total_days,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_days,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
          AVG(a.total_hours) as avg_hours,
          SUM(a.total_hours) as total_hours
         FROM attendance a
         JOIN users u ON a.user_id = u.id
         ${whereClause}`,
        queryParams,
      )

      // Get daily attendance chart data
      const [dailyData]: any = await pool.query(
        `SELECT 
          a.date,
          COUNT(*) as total_attendance,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count
         FROM attendance a
         JOIN users u ON a.user_id = u.id
         ${whereClause}
         GROUP BY a.date
         ORDER BY a.date`,
        queryParams,
      )

      // Get status distribution
      const [statusData]: any = await pool.query(
        `SELECT 
          a.status,
          COUNT(*) as count
         FROM attendance a
         JOIN users u ON a.user_id = u.id
         ${whereClause}
         GROUP BY a.status`,
        queryParams,
      )

      return NextResponse.json({
        success: true,
        data: {
          summary: summaryData[0],
          dailyChart: dailyData,
          statusChart: statusData,
        },
      })
    } else if (reportType === "detailed") {
      // Get detailed attendance records
      const [detailedData]: any = await pool.query(
        `SELECT 
          a.*,
          u.name,
          u.employee_id,
          u.department,
          u.position
         FROM attendance a
         JOIN users u ON a.user_id = u.id
         ${whereClause}
         ORDER BY a.date DESC, u.name`,
        queryParams,
      )

      return NextResponse.json({
        success: true,
        data: detailedData,
      })
    }

    return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 })
  } catch (error: any) {
    console.error("Attendance report error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

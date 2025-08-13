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
    const status = searchParams.get("status")

    let whereClause = "WHERE 1=1"
    const queryParams: any[] = []

    if (startDate && endDate) {
      whereClause += " AND lr.start_date BETWEEN ? AND ?"
      queryParams.push(startDate, endDate)
    }

    if (userId && user.role === "admin") {
      whereClause += " AND lr.user_id = ?"
      queryParams.push(userId)
    } else if (user.role !== "admin") {
      whereClause += " AND lr.user_id = ?"
      queryParams.push(user.id)
    }

    if (department && user.role === "admin") {
      whereClause += " AND u.department = ?"
      queryParams.push(department)
    }

    if (status) {
      whereClause += " AND lr.status = ?"
      queryParams.push(status)
    }

    // Get leave summary
    const [summaryData]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN lr.status = 'approved' THEN 1 ELSE 0 END) as approved_requests,
        SUM(CASE WHEN lr.status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN lr.status = 'rejected' THEN 1 ELSE 0 END) as rejected_requests,
        SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE 0 END) as total_approved_days,
        AVG(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE NULL END) as avg_leave_days
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       ${whereClause}`,
      queryParams,
    )

    // Get leave type distribution
    const [leaveTypeData]: any = await pool.query(
      `SELECT 
        lr.leave_type,
        COUNT(*) as count,
        SUM(lr.days_requested) as total_days
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       ${whereClause}
       GROUP BY lr.leave_type`,
      queryParams,
    )

    // Get monthly leave trends
    const [monthlyData]: any = await pool.query(
      `SELECT 
        DATE_FORMAT(lr.start_date, '%Y-%m') as month,
        COUNT(*) as total_requests,
        SUM(lr.days_requested) as total_days
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       ${whereClause}
       GROUP BY DATE_FORMAT(lr.start_date, '%Y-%m')
       ORDER BY month`,
      queryParams,
    )

    // Get detailed leave records if requested
    const [detailedData]: any = await pool.query(
      `SELECT 
        lr.*,
        u.name,
        u.employee_id,
        u.department,
        approver.name as approved_by_name
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       LEFT JOIN users approver ON lr.approved_by = approver.id
       ${whereClause}
       ORDER BY lr.created_at DESC`,
      queryParams,
    )

    return NextResponse.json({
      success: true,
      data: {
        summary: summaryData[0],
        leaveTypeChart: leaveTypeData,
        monthlyChart: monthlyData,
        detailed: detailedData,
      },
    })
  } catch (error: any) {
    console.error("Leave report error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

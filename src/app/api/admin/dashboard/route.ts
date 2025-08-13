/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const [totalUsers]: any = await pool.query("SELECT COUNT(*) as total FROM users WHERE is_active = TRUE")

    // Get today's attendance stats
    const [todayAttendance]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_checked_in,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN check_out_time IS NULL THEN 1 ELSE 0 END) as still_working
       FROM attendance 
       WHERE date = CURDATE()`,
    )

    // Get pending leave requests
    const [pendingLeaves]: any = await pool.query(
      "SELECT COUNT(*) as total FROM leave_requests WHERE status = 'pending'",
    )

    // Get this month's attendance summary
    const [monthlyStats]: any = await pool.query(
      `SELECT 
        COUNT(DISTINCT user_id) as active_employees,
        COUNT(*) as total_attendance_records,
        AVG(total_hours) as avg_working_hours
       FROM attendance 
       WHERE MONTH(date) = MONTH(CURRENT_DATE()) AND YEAR(date) = YEAR(CURRENT_DATE())`,
    )

    // Get recent activities
    const [recentActivities]: any = await pool.query(
      `SELECT 
        'attendance' as type,
        u.name,
        u.employee_id,
        a.date,
        a.check_in_time,
        a.status,
        a.created_at
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
       ORDER BY a.created_at DESC
       LIMIT 10`,
    )

    // Get department stats
    const [departmentStats]: any = await pool.query(
      `SELECT 
        department,
        COUNT(*) as employee_count
       FROM users 
       WHERE is_active = TRUE AND department IS NOT NULL
       GROUP BY department
       ORDER BY employee_count DESC`,
    )

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers[0].total,
        todayAttendance: todayAttendance[0],
        pendingLeaves: pendingLeaves[0].total,
        monthlyStats: monthlyStats[0],
        recentActivities,
        departmentStats,
      },
    })
  } catch (error: any) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

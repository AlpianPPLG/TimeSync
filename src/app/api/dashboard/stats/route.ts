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

    // Get current month stats
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Get total working days in current month (excluding weekends)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [workingDaysResult]: any = await pool.query(
      `SELECT COUNT(*) as total_days 
       FROM work_schedules ws 
       WHERE ws.user_id = ? AND ws.is_working_day = TRUE`,
      [user.id],
    )

    // Get attendance stats for current month
    const [attendanceStats]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count
       FROM attendance 
       WHERE user_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [user.id, currentMonth, currentYear],
    )

    const stats = attendanceStats[0] || {
      total_records: 0,
      present_days: 0,
      absent_days: 0,
      late_count: 0,
    }

    // Calculate total working days (approximate for current month)
    const totalWorkingDays = Math.max(stats.total_records, 20) // Default to 20 working days per month

    return NextResponse.json({
      totalDays: totalWorkingDays,
      presentDays: stats.present_days,
      absentDays: stats.absent_days,
      lateCount: stats.late_count,
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || decoded.userId

    // Get user's work schedule
    const [schedules] = await pool.execute(
      `SELECT ws.*, u.name, u.employee_id 
       FROM work_schedules ws 
       JOIN users u ON ws.user_id = u.id 
       WHERE ws.user_id = ? 
       ORDER BY FIELD(ws.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
      [userId],
    )

    return NextResponse.json({
      success: true,
      data: schedules,
    })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json({ error: "Gagal mengambil jadwal" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Token tidak ditemukan" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 })
    }

    const { userId, schedules } = await request.json()

    // Only admin can update other users' schedules
    if (decoded.role !== "admin" && userId !== decoded.userId) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 })
    }

    // Delete existing schedules for the user
    await pool.execute("DELETE FROM work_schedules WHERE user_id = ?", [userId])

    // Insert new schedules
    for (const schedule of schedules) {
      await pool.execute(
        `INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time, is_working_day, day_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          userId,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.day_type === "kerja", // Set is_working_day based on day_type
          schedule.day_type,
        ],
      )
    }

    return NextResponse.json({
      success: true,
      message: "Jadwal berhasil disimpan",
    })
  } catch (error) {
    console.error("Error saving schedule:", error)
    return NextResponse.json({ error: "Gagal menyimpan jadwal" }, { status: 500 })
  }
}

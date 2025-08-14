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
    const userId = searchParams.get("userId") || decoded.id

    // Get user's work schedule
    const [schedules] = await pool.execute(
      `SELECT ws.*, u.name, u.employee_id 
       FROM work_schedules ws 
       JOIN users u ON ws.user_id = u.id 
       WHERE ws.user_id = ? 
       ORDER BY FIELD(ws.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
      [userId],
    )

    // If no schedules exist, create default ones
    if ((schedules as any[]).length === 0) {
      const defaultSchedules = [
        { day_of_week: 'monday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'kerja', is_working_day: true },
        { day_of_week: 'tuesday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'kerja', is_working_day: true },
        { day_of_week: 'wednesday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'kerja', is_working_day: true },
        { day_of_week: 'thursday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'kerja', is_working_day: true },
        { day_of_week: 'friday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'kerja', is_working_day: true },
        { day_of_week: 'saturday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'libur', is_working_day: false },
        { day_of_week: 'sunday', start_time: '09:00:00', end_time: '17:00:00', day_type: 'libur', is_working_day: false }
      ]
      
      for (const schedule of defaultSchedules) {
        await pool.execute(
          `INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time, is_working_day, day_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, schedule.day_of_week, schedule.start_time, schedule.end_time, schedule.is_working_day, schedule.day_type]
        )
      }
      
      // Fetch the newly created schedules
      const [newSchedules] = await pool.execute(
        `SELECT ws.*, u.name, u.employee_id 
         FROM work_schedules ws 
         JOIN users u ON ws.user_id = u.id 
         WHERE ws.user_id = ? 
         ORDER BY FIELD(ws.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')`,
        [userId],
      )
      
      return NextResponse.json({
        success: true,
        data: newSchedules,
      })
    }

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
    const targetUserId = userId || decoded.id
    if (decoded.role !== "admin" && targetUserId !== decoded.id) {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 })
    }

    // Validate schedules data
    if (!schedules || !Array.isArray(schedules)) {
      return NextResponse.json({ error: "Data jadwal tidak valid" }, { status: 400 })
    }

    // Delete existing schedules for the user
    await pool.execute("DELETE FROM work_schedules WHERE user_id = ?", [targetUserId])

    // Insert new schedules
    for (const schedule of schedules) {
      // Validate required fields
      if (!schedule.day_of_week || !schedule.start_time || !schedule.end_time || !schedule.day_type) {
        continue // Skip invalid schedules
      }
      
      await pool.execute(
        `INSERT INTO work_schedules (user_id, day_of_week, start_time, end_time, is_working_day, day_type) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          targetUserId,
          schedule.day_of_week,
          schedule.start_time,
          schedule.end_time,
          schedule.is_working_day !== undefined ? schedule.is_working_day : (schedule.day_type === "kerja"),
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

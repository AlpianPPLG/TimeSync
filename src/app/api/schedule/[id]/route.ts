import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { day_type, is_working_day, start_time, end_time } = await request.json()
    const scheduleId = params.id

    const [result] = await pool.execute(
      `UPDATE work_schedules 
       SET day_type = ?, is_working_day = ?, start_time = ?, end_time = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [
        day_type,
        is_working_day || (day_type === "kerja" ? 1 : 0),
        start_time || "09:00:00",
        end_time || "17:00:00",
        scheduleId,
        decoded.userId,
      ],
    )

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Schedule not found or unauthorized" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Schedule updated successfully",
    })
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

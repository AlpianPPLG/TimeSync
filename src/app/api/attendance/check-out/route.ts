/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { format, differenceInMinutes } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { notes } = await request.json()
    const today = format(new Date(), "yyyy-MM-dd")
    const currentTime = format(new Date(), "HH:mm:ss")

    // Get today's attendance record
    const [existingRecord]: any = await pool.query("SELECT * FROM attendance WHERE user_id = ? AND date = ? LIMIT 1", [
      user.id,
      today,
    ])

    if (existingRecord.length === 0 || !existingRecord[0].check_in_time) {
      return NextResponse.json({ success: false, message: "Anda belum check-in hari ini" }, { status: 400 })
    }

    if (existingRecord[0].check_out_time) {
      return NextResponse.json({ success: false, message: "Anda sudah check-out hari ini" }, { status: 400 })
    }

    // Calculate total hours
    const checkInTime = new Date(`${today} ${existingRecord[0].check_in_time}`)
    const checkOutTime = new Date(`${today} ${currentTime}`)
    const totalMinutes = differenceInMinutes(checkOutTime, checkInTime)
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100 // Round to 2 decimal places

    // Update record with check-out time
    await pool.query(
      "UPDATE attendance SET check_out_time = ?, total_hours = ?, notes = CONCAT(COALESCE(notes, ''), ?, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [currentTime, totalHours, notes ? " | Check-out: " : "", notes || "", existingRecord[0].id],
    )

    return NextResponse.json({
      success: true,
      message: `Check-out berhasil pada ${currentTime}`,
      data: {
        check_out_time: currentTime,
        total_hours: totalHours,
      },
    })
  } catch (error: any) {
    console.error("Check-out error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

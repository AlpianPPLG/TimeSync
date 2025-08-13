/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { format } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { location, notes } = await request.json()
    const today = format(new Date(), "yyyy-MM-dd")
    const currentTime = format(new Date(), "HH:mm:ss")
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Check if already checked in today
    const [existingRecord]: any = await pool.query("SELECT * FROM attendance WHERE user_id = ? AND date = ? LIMIT 1", [
      user.id,
      today,
    ])

    if (existingRecord.length > 0 && existingRecord[0].check_in_time) {
      return NextResponse.json({ success: false, message: "Anda sudah check-in hari ini" }, { status: 400 })
    }

    // Get user's work schedule for today
    const dayOfWeek = format(new Date(), "EEEE").toLowerCase()
    const [scheduleResult]: any = await pool.query(
      "SELECT * FROM work_schedules WHERE user_id = ? AND day_of_week = ? LIMIT 1",
      [user.id, dayOfWeek],
    )

    let status = "present"
    if (scheduleResult.length > 0) {
      const scheduledTime = scheduleResult[0].start_time
      if (currentTime > scheduledTime) {
        status = "late"
      }
    }

    if (existingRecord.length > 0) {
      // Update existing record
      await pool.query(
        "UPDATE attendance SET check_in_time = ?, status = ?, location = ?, ip_address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [currentTime, status, location, ipAddress, notes, existingRecord[0].id],
      )
    } else {
      // Create new record
      await pool.query(
        "INSERT INTO attendance (user_id, date, check_in_time, status, location, ip_address, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [user.id, today, currentTime, status, location, ipAddress, notes],
      )
    }

    return NextResponse.json({
      success: true,
      message: `Check-in berhasil pada ${currentTime}`,
      data: {
        check_in_time: currentTime,
        status,
        location,
      },
    })
  } catch (error: any) {
    console.error("Check-in error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

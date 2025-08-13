/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import type { NextRequest } from "next/server"
import { format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const today = format(new Date(), "yyyy-MM-dd")

    // Get today's attendance
    const [rows]: any = await pool.query("SELECT * FROM attendance WHERE user_id = ? AND date = ? LIMIT 1", [
      user.id,
      today,
    ])

    const attendance = rows.length > 0 ? rows[0] : null

    return NextResponse.json({
      success: true,
      attendance,
    })
  } catch (error: any) {
    console.error("Today attendance error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

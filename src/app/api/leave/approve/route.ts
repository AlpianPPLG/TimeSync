/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"
import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin", "manager"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { leave_request_id, action, rejection_reason } = await request.json()

    if (!leave_request_id || !action) {
      return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 })
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ success: false, message: "Action tidak valid" }, { status: 400 })
    }

    if (action === "rejected" && !rejection_reason) {
      return NextResponse.json({ success: false, message: "Alasan penolakan wajib diisi" }, { status: 400 })
    }

    // Check if leave request exists and is pending
    const [leaveRequest]: any = await pool.query(
      "SELECT * FROM leave_requests WHERE id = ? AND status = 'pending' LIMIT 1",
      [leave_request_id],
    )

    if (leaveRequest.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengajuan cuti tidak ditemukan atau sudah diproses" },
        { status: 404 },
      )
    }

    // Update leave request status
    await pool.query(
      `UPDATE leave_requests 
       SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [action, user.id, rejection_reason || null, leave_request_id],
    )

    const actionText = action === "approved" ? "disetujui" : "ditolak"

    return NextResponse.json({
      success: true,
      message: `Pengajuan cuti berhasil ${actionText}`,
    })
  } catch (error: any) {
    console.error("Leave approval error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

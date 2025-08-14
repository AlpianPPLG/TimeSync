import { type NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"

export async function POST(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json(
        { success: false, message: "Akses ditolak. Hanya admin yang diizinkan." },
        { status: 403 }
      )
    }

    // Await params before using
    const params = await context.params
    const requestId = Number(params.id)
    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, message: "ID pengajuan tidak valid" },
        { status: 400 }
      )
    }

    // Check if leave request exists and is pending
    const [existingRequest] = await pool.execute(
      `SELECT lr.*, u.name as user_name, u.employee_id 
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE lr.id = ? AND lr.status = 'pending'`,
      [requestId]
    )

    const requests = existingRequest as any[]
    if (requests.length === 0) {
      return NextResponse.json(
        { success: false, message: "Pengajuan cuti tidak ditemukan, sudah diproses, atau bukan status pending" },
        { status: 404 }
      )
    }

    // Update leave request status to approved
    await pool.execute(
      `UPDATE leave_requests 
       SET status = 'approved', 
           approved_by = ?, 
           approved_at = NOW() 
       WHERE id = ?`,
      [user.id, requestId]
    )

    return NextResponse.json({
      success: true,
      message: "Pengajuan cuti berhasil disetujui",
    })
  } catch (error) {
    console.error("Error approving leave request:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

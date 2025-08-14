import { type NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"
import mysql from 'mysql2/promise'
import pool from "@/lib/db"
import { JWT_SECRET } from "@/lib/auth"

export async function POST(
  request: NextRequest, 
  context: { params: { id: string } }
) {
  let connection: mysql.PoolConnection | null = null
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Token tidak valid" },
        { status: 401 }
      )
    }

    const token = authHeader.split(" ")[1]
    let userId: number
    
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      
      if (payload.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Akses ditolak. Hanya admin yang diizinkan." },
          { status: 403 }
        )
      }
      userId = Number(payload.sub)
    } catch (error) {
      console.error("Token verification error:", error)
      return NextResponse.json(
        { success: false, message: "Token tidak valid atau kadaluarsa" },
        { status: 401 }
      )
    }

    // Get the ID from the route parameters
    const requestId = Number(context.params.id)
    if (isNaN(requestId)) {
      return NextResponse.json(
        { success: false, message: "ID pengajuan tidak valid" },
        { status: 400 }
      )
    }

    const { rejection_reason } = await request.json()
    if (typeof rejection_reason !== 'string' || rejection_reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Alasan penolakan harus diisi" },
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

    try {
      // Get a connection from the pool
      connection = await pool.getConnection()
      
      // Start transaction
      await connection.beginTransaction()

      // First verify the user exists and has permission
      const [userCheck] = await connection.execute(
        'SELECT id FROM users WHERE id = ? LIMIT 1',
        [userId]
      )
      
      if (!Array.isArray(userCheck) || userCheck.length === 0) {
        throw new Error('User not found')
      }

      // Update leave request status to rejected
      await connection.execute(
        `UPDATE leave_requests 
         SET status = 'rejected', 
             rejected_by = ?, 
             rejected_at = NOW(),
             rejection_reason = ?
         WHERE id = ?`,
        [userId, rejection_reason, requestId]
      )

      // Commit the transaction
      await connection.commit()
    } catch (error) {
      // Rollback in case of error
      if (connection) await connection.rollback()
      console.error('Error rejecting leave request:', error)
      throw error
    } finally {
      // Release the connection back to the pool
      if (connection) connection.release()
    }

    return NextResponse.json({
      success: true,
      message: "Pengajuan cuti berhasil ditolak",
    })
  } catch (error) {
    console.error("Error rejecting leave request:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

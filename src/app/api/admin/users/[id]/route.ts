/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { requireAuth, requireRole } from "@/lib/auth"
import type { NextRequest } from "next/server"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)
    const { employee_id, name, email, password, role, department, position, phone, address, is_active } =
      await request.json()

    // Check if user exists
    const [existingUser]: any = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId])

    if (existingUser.length === 0) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 })
    }

    // Check for duplicate email/employee_id (excluding current user)
    const [duplicateCheck]: any = await pool.query(
      "SELECT id FROM users WHERE (email = ? OR employee_id = ?) AND id != ? LIMIT 1",
      [email, employee_id, userId],
    )

    if (duplicateCheck.length > 0) {
      return NextResponse.json({ success: false, message: "Email atau Employee ID sudah digunakan" }, { status: 400 })
    }

    let updateQuery = `UPDATE users SET 
      employee_id = ?, name = ?, email = ?, role = ?, department = ?, 
      position = ?, phone = ?, address = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP`
    const queryParams = [employee_id, name, email, role, department, position, phone, address, is_active]

    // Update password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 12)
      updateQuery += ", password = ?"
      queryParams.push(hashedPassword)
    }

    updateQuery += " WHERE id = ?"
    queryParams.push(userId)

    await pool.query(updateQuery, queryParams)

    return NextResponse.json({
      success: true,
      message: "User berhasil diupdate",
    })
  } catch (error: any) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = requireAuth(request)
    if (!user || !requireRole(user, ["admin"])) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(params.id)

    // Check if user exists
    const [existingUser]: any = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId])

    if (existingUser.length === 0) {
      return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json({ success: false, message: "Tidak dapat menghapus akun sendiri" }, { status: 400 })
    }

    // Soft delete by setting is_active to false
    await pool.query("UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [userId])

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus",
    })
  } catch (error: any) {
    console.error("Admin delete user error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

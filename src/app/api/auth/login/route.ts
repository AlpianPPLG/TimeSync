/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email dan password wajib diisi" }, { status: 400 })
    }

    // Get user from database
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1", [email])

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Email tidak terdaftar atau akun tidak aktif" },
        { status: 401 },
      )
    }

    const user = rows[0]

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 })
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_SECRET || "attendance-secret-key", 
      { expiresIn: "24h" },
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        token,
        user: userWithoutPassword,
      },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Login Error:", error)
    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

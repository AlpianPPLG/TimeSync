/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import pool from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { employee_id, name, email, password, role, department, position } = await req.json()

    // Validate required fields
    if (!employee_id || !name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Employee ID, nama, email, dan password wajib diisi" },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Format email tidak valid" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 })
    }

    // Check if email or employee_id already exists
    const [existingUser]: any = await pool.query("SELECT id FROM users WHERE email = ? OR employee_id = ? LIMIT 1", [
      email,
      employee_id,
    ])

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, message: "Email atau Employee ID sudah terdaftar" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Insert new user
    const [result]: any = await pool.query(
      `INSERT INTO users (employee_id, name, email, password, role, department, position, hire_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [employee_id, name, email, hashedPassword, role || "employee", department, position],
    )

    return NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil",
        user_id: result.insertId,
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error("Register Error:", error)

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ success: false, message: "Email atau Employee ID sudah terdaftar" }, { status: 400 })
    }

    return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

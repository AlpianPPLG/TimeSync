"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  employee_id: string
  name: string
  email: string
  password: string
  role?: string
  department?: string
  position?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("attendance_token")
    const storedUser = localStorage.getItem("attendance_user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.token)
        setUser(data.user)
        localStorage.setItem("attendance_token", data.token)
        localStorage.setItem("attendance_user", JSON.stringify(data.user))
      }

      return data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { success: false, message: "Terjadi kesalahan koneksi" }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()
      return data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return { success: false, message: "Terjadi kesalahan koneksi" }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("attendance_token")
    localStorage.removeItem("attendance_user")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

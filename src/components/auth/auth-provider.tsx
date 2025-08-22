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
  refreshToken: (token: string) => Promise<{ success: boolean; token?: string; message?: string }>
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
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem("attendance_token")
    const storedUser = localStorage.getItem("attendance_user")

    if (storedToken && storedUser) {
      try {
        const tokenData = JSON.parse(atob(storedToken.split('.')[1]));
        const isExpired = Date.now() >= tokenData.exp * 1000;
        
        if (!isExpired) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Schedule token refresh before it expires (5 minutes before)
          const expiresIn = (tokenData.exp * 1000) - Date.now() - (5 * 60 * 1000);
          if (expiresIn > 0) {
            const refreshTimer = setTimeout(refreshToken, expiresIn);
            return () => clearTimeout(refreshTimer);
          }
        } else {
          // Token is expired, log out
          logout();
        }
      } catch (error) {
        console.error("Error parsing token:", error);
        logout();
      }
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Set up token refresh before it expires (5 minutes before)
        const tokenData = JSON.parse(atob(data.token.split('.')[1]));
        const expiresIn = (tokenData.exp * 1000) - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
        if (expiresIn > 0) {
          setTimeout(refreshToken, expiresIn);
        }
      }

      return data
    } catch (error) {
      console.error("Login error:", error);
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

  const refreshToken = async (currentToken: string) => {
    if (isRefreshing) return { success: false, message: 'Refresh already in progress' };
    
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${currentToken}`
        },
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem("attendance_token", data.token);
        
        // Schedule next refresh
        try {
          const tokenData = JSON.parse(atob(data.token.split('.')[1]));
          const expiresIn = (tokenData.exp * 1000) - Date.now() - (5 * 60 * 1000); // 5 minutes before expiry
          if (expiresIn > 0) {
            setTimeout(() => refreshToken(data.token), expiresIn);
          }
        } catch (parseError) {
          console.error('Error parsing token for refresh scheduling:', parseError);
        }
        
        return { success: true, token: data.token };
      }
      
      return { success: false, message: data.message || 'Failed to refresh token' };
    } catch (error) {
      console.error("Token refresh failed:", error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to refresh token' 
      };
    } finally {
      setIsRefreshing(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("attendance_token");
    localStorage.removeItem("attendance_user");
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      refreshToken,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

import type React from "react"

import { Sidebar } from "./sidebar"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 overflow-auto lg:ml-0">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

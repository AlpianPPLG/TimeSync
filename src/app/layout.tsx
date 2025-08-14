import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ToastProvider, Toast } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Attendance System",
  description: "Employee Attendance Management System",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          {children}
          <ToastProvider>
            <Toast />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

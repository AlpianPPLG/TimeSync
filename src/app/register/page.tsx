"use client"

import { useState } from "react"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showSuccess, setShowSuccess] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance System</h1>
          <p className="text-gray-600">Daftarkan Karyawan Baru</p>
        </div>

        <RegisterForm onSuccess={() => setShowSuccess(true)} />

        <div className="text-center">
          <Link href="/login">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

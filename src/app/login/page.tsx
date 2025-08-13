import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance System</h1>
          <p className="text-gray-600">Sistem Manajemen Absensi Karyawan</p>
        </div>
        <LoginForm />
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Belum Punya Akun?{' '}
            <Link 
              href="/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Daftar Di Sini!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

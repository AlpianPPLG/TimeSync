import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AttendanceTable } from "@/components/attendance/attendance-table"
import { QuickActions } from "@/components/attendance/quick-actions"

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Absensi</h1>
          <p className="text-gray-600">Kelola absensi dan riwayat kehadiran Anda</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <QuickActions />
          </div>
          <div className="lg:col-span-2">
            {/* Today's Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Hari Ini</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">08:00</p>
                  <p className="text-sm text-gray-600">Check In</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">--:--</p>
                  <p className="text-sm text-gray-600">Check Out</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance History */}
        <AttendanceTable />
      </div>
    </DashboardLayout>
  )
}

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TodayAttendance } from "@/components/dashboard/today-attendance"

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Selamat datang di sistem absensi</p>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Today's Attendance and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TodayAttendance />

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Check In</p>
                    <p className="text-xs text-gray-500">Hari ini, 09:00</p>
                  </div>
                  <div className="text-green-600 text-sm">Berhasil</div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Check Out</p>
                    <p className="text-xs text-gray-500">Kemarin, 17:00</p>
                  </div>
                  <div className="text-green-600 text-sm">Berhasil</div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">Pengajuan Cuti</p>
                    <p className="text-xs text-gray-500">2 hari yang lalu</p>
                  </div>
                  <div className="text-yellow-600 text-sm">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

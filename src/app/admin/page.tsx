/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Calendar, BarChart3, CheckCircle } from "lucide-react"

interface AdminDashboardData {
  totalUsers: number
  todayAttendance: {
    total_checked_in: number
    on_time: number
    late: number
    still_working: number
  }
  pendingLeaves: number
  monthlyStats: {
    active_employees: number
    total_attendance_records: number
    avg_working_hours: number
  }
  recentActivities: any[]
  departmentStats: any[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setData(result.data)
      }
    } catch (error) {
      console.error("Error fetching admin dashboard:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout allowedRoles={["admin"]}>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Kelola sistem absensi dan monitor aktivitas karyawan</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout allowedRoles={["admin"]}>
        <div className="text-center py-8">
          <p className="text-gray-500">Gagal memuat data dashboard</p>
        </div>
      </DashboardLayout>
    )
  }

  const statsCards = [
    {
      title: "Total Karyawan",
      value: data.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Hadir Hari Ini",
      value: data.todayAttendance.total_checked_in,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Terlambat Hari Ini",
      value: data.todayAttendance.late,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pengajuan Cuti Pending",
      value: data.pendingLeaves,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Kelola sistem absensi dan monitor aktivitas karyawan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistik Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Karyawan Aktif</span>
                <span className="text-lg font-bold">{data.monthlyStats.active_employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total Record Absensi</span>
                <span className="text-lg font-bold">{data.monthlyStats.total_attendance_records}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Rata-rata Jam Kerja</span>
                <span className="text-lg font-bold">
                  {data.monthlyStats.avg_working_hours ? `${data.monthlyStats.avg_working_hours.toFixed(1)} jam` : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Department Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Departemen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.departmentStats.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{dept.department}</span>
                    <span className="text-sm font-bold">{dept.employee_count} karyawan</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru (24 Jam Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivities.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Tidak ada aktivitas terbaru</p>
              ) : (
                data.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.name} ({activity.employee_id})
                        </p>
                        <p className="text-xs text-gray-500">
                          Check-in pada {activity.check_in_time} - Status: {activity.status}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{activity.date}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

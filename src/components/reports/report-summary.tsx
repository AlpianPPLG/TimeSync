/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface ReportSummaryProps {
  data: any
  type: "attendance" | "leave"
}

export function ReportSummary({ data, type }: ReportSummaryProps) {
  if (type === "attendance") {
    const attendanceRate = data.total_days > 0 ? Math.round((data.present_days / data.total_days) * 100) : 0

    const cards = [
      {
        title: "Total Hari",
        value: data.total_days || 0,
        icon: Calendar,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      },
      {
        title: "Hadir",
        value: data.present_days || 0,
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      },
      {
        title: "Terlambat",
        value: data.late_days || 0,
        icon: Clock,
        color: "text-orange-600",
        bgColor: "bg-orange-50",
      },
      {
        title: "Tidak Hadir",
        value: data.absent_days || 0,
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
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

        {/* Attendance Rate Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Tingkat Kehadiran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${attendanceRate * 2.51} 251`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">{attendanceRate}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Hours Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rata-rata Jam Kerja</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.avg_hours ? `${data.avg_hours.toFixed(1)}h` : "0h"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Hours Card */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jam Kerja</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data.total_hours ? `${data.total_hours.toFixed(0)}h` : "0h"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-50">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Leave summary
  const approvalRate = data.total_requests > 0 ? Math.round((data.approved_requests / data.total_requests) * 100) : 0

  const cards = [
    {
      title: "Total Pengajuan",
      value: data.total_requests || 0,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Disetujui",
      value: data.approved_requests || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Menunggu",
      value: data.pending_requests || 0,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Ditolak",
      value: data.rejected_requests || 0,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
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

      {/* Approval Rate Card */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">Tingkat Persetujuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#10b981"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${approvalRate * 2.51} 251`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{approvalRate}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Leave Days Card */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Hari Cuti</p>
              <p className="text-3xl font-bold text-gray-900">
                {data.avg_leave_days ? `${data.avg_leave_days.toFixed(1)}` : "0"}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-50">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Approved Days Card */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Hari Disetujui</p>
              <p className="text-3xl font-bold text-gray-900">{data.total_approved_days || 0}</p>
            </div>
            <div className="p-3 rounded-full bg-indigo-50">
              <CheckCircle className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

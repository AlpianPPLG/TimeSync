/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportSummary } from "@/components/reports/report-summary"
import { AttendanceChart } from "@/components/reports/attendance-chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner";

export default function ReportsPage() {
  const [attendanceData, setAttendanceData] = useState<any>(null)
  const [leaveData, setLeaveData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    fetchReports()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const params = new URLSearchParams({
        type: "summary",
        ...filters,
      })

      // Fetch attendance report
      const attendanceResponse = await fetch(`/api/reports/attendance?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (attendanceResponse.ok) {
        const attendanceResult = await attendanceResponse.json()
        setAttendanceData(attendanceResult.data)
      }

      // Fetch leave report
      const leaveResponse = await fetch(`/api/reports/leave?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (leaveResponse.ok) {
        const leaveResult = await leaveResponse.json()
        setLeaveData(leaveResult.data)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast("Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (reportType: "attendance" | "leave", format: string) => {
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportType,
          format,
          ...filters,
        }),
      })

      if (response.ok) {
        if (format === "csv") {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        } else {
          const result = await response.json()
          // Handle Excel export (would need additional library like xlsx)
          toast("Export berhasil")
        }
      }
    } catch (error) {
      toast("Gagal mengexport laporan")
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
            <p className="text-gray-600">Analisis dan laporan data absensi dan cuti</p>
          </div>

          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-600">Analisis dan laporan data absensi dan cuti</p>
        </div>

        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="attendance">Laporan Absensi</TabsTrigger>
            <TabsTrigger value="leave">Laporan Cuti</TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ReportFilters
                  reportType="attendance"
                  onFilterChange={setFilters}
                  onExport={(format) => handleExport("attendance", format)}
                />
              </div>
              <div className="lg:col-span-3 space-y-6">
                {attendanceData && (
                  <>
                    <ReportSummary data={attendanceData.summary} type="attendance" />
                    <AttendanceChart dailyData={attendanceData.dailyChart} statusData={attendanceData.statusChart} />
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leave" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <ReportFilters
                  reportType="leave"
                  onFilterChange={setFilters}
                  onExport={(format) => handleExport("leave", format)}
                />
              </div>
              <div className="lg:col-span-3 space-y-6">
                {leaveData && <ReportSummary data={leaveData.summary} type="leave" />}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

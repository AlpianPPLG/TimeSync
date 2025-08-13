"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, LogIn, LogOut } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface TodayAttendance {
  id?: number
  date: string
  check_in_time?: string
  check_out_time?: string
  status: string
  location?: string
  total_hours?: number
}

export function TodayAttendance() {
  const [attendance, setAttendance] = useState<TodayAttendance | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchTodayAttendance()
  }, [])

  const fetchTodayAttendance = async () => {
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/attendance/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(data.attendance)
      }
    } catch (error) {
      console.error("Error fetching today's attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/attendance/check-in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          location: "Office", // You can get this from geolocation
        }),
      })

      if (response.ok) {
        fetchTodayAttendance()
      }
    } catch (error) {
      console.error("Error checking in:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/attendance/check-out", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        fetchTodayAttendance()
      }
    } catch (error) {
      console.error("Error checking out:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: "Hadir", variant: "default" as const },
      late: { label: "Terlambat", variant: "destructive" as const },
      absent: { label: "Tidak Hadir", variant: "secondary" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Absensi Hari Ini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const today = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Absensi Hari Ini
        </CardTitle>
        <p className="text-sm text-gray-600">{today}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {attendance ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(attendance.status)}
            </div>

            {attendance.check_in_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check In:</span>
                <span className="text-sm text-gray-600">{attendance.check_in_time}</span>
              </div>
            )}

            {attendance.check_out_time && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Check Out:</span>
                <span className="text-sm text-gray-600">{attendance.check_out_time}</span>
              </div>
            )}

            {attendance.location && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Lokasi:</span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {attendance.location}
                </span>
              </div>
            )}

            {attendance.total_hours && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Jam:</span>
                <span className="text-sm text-gray-600">{attendance.total_hours} jam</span>
              </div>
            )}

            <div className="pt-4 space-y-2">
              {!attendance.check_in_time && (
                <Button onClick={handleCheckIn} disabled={actionLoading} className="w-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Check In"}
                </Button>
              )}

              {attendance.check_in_time && !attendance.check_out_time && (
                <Button
                  onClick={handleCheckOut}
                  disabled={actionLoading}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Check Out"}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">Belum ada data absensi hari ini</p>
            <Button onClick={handleCheckIn} disabled={actionLoading} className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              {actionLoading ? "Processing..." : "Check In"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

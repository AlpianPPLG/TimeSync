/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { toast } from "sonner"

export type DayType = "kerja" | "libur" | "cuti" | "izin"

interface Schedule {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  is_working_day: boolean
  day_type: DayType
}

interface ScheduleCalendarProps {
  userId?: string
  onEdit?: () => void
  editable?: boolean
}

const daysOfWeek = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
]

const dayTypeOptions = [
  { value: "kerja" as const, label: "Kerja", color: "bg-green-50 text-green-700 border-green-200" },
  { value: "libur" as const, label: "Libur", color: "bg-gray-50 text-gray-700 border-gray-200" },
  { value: "cuti" as const, label: "Cuti", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "izin" as const, label: "Izin", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
]

export function ScheduleCalendar({ userId, onEdit, editable = false }: ScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchSchedule()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem("attendance_user");
    if (userData) {
      const user = JSON.parse(userData);
      setIsAdmin(user.role === "admin");
    }
  }, []);

  const fetchSchedule = async () => {
    try {
      const token = localStorage.getItem("attendance_token")
      const params = userId ? `?userId=${userId}` : ""
      const response = await fetch(`/api/schedule${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setSchedules(result.data)
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  const getScheduleForDay = (dayKey: string) => {
    return schedules.find((s) => s.day_of_week === dayKey)
  }

  const formatTime = (time: string) => {
    return time.slice(0, 5) // Remove seconds
  }

  const handleDayTypeChange = async (dayKey: string, newDayType: DayType) => {
    try {
      const token = localStorage.getItem("attendance_token")
      if (!token) {
        toast.error("Token autentikasi tidak ditemukan")
        return
      }

      // Check if user is admin before allowing changes
      if (!isAdmin) {
        toast.error("Hanya Admin Yang Dapat Edit")
        return
      }

      // Optimistically update UI first
      setSchedules(prev => {
        const updated = [...prev]
        const existingIndex = updated.findIndex(s => s.day_of_week === dayKey)
        
        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            day_type: newDayType,
            is_working_day: newDayType === "kerja"
          }
        } else {
          updated.push({
            id: 0,
            day_of_week: dayKey,
            start_time: newDayType === "kerja" ? "09:00:00" : "00:00:00",
            end_time: newDayType === "kerja" ? "17:00:00" : "00:00:00",
            is_working_day: newDayType === "kerja",
            day_type: newDayType
          })
        }
        return updated
      })

      // Prepare data for API
      const updatedSchedules = schedules.map(s => 
        s.day_of_week === dayKey 
          ? { ...s, day_type: newDayType, is_working_day: newDayType === "kerja" }
          : s
      )
      
      // Add new schedule if doesn't exist
      if (!schedules.find(s => s.day_of_week === dayKey)) {
        updatedSchedules.push({
          id: 0,
          day_of_week: dayKey,
          start_time: newDayType === "kerja" ? "09:00:00" : "00:00:00",
          end_time: newDayType === "kerja" ? "17:00:00" : "00:00:00",
          is_working_day: newDayType === "kerja",
          day_type: newDayType
        })
      }

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId || undefined,
          schedules: updatedSchedules.map(s => ({
            day_of_week: s.day_of_week,
            start_time: s.start_time,
            end_time: s.end_time,
            day_type: s.day_type,
            is_working_day: s.is_working_day
          }))
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || "Gagal memperbarui jadwal")
      }

      // Show success message
      toast.success("Jadwal berhasil diperbarui!")
      
      // Refresh data from server
      fetchSchedule()
      
    } catch (error) {
      console.error("Error updating schedule:", error)
      toast.error(error instanceof Error ? error.message : "Gagal memperbarui jadwal")
      
      // Revert optimistic update on error
      fetchSchedule()
    }
  }

  const getDayTypeStyle = (dayType: string) => {
    const option = dayTypeOptions.find((opt) => opt.value === dayType)
    return option?.color || "bg-gray-50 text-gray-700 border-gray-200"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Jadwal Kerja
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Jadwal Kerja
          </CardTitle>
          {editable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (!isAdmin) {
                  toast.error("Hanya Admin Yang Dapat Edit")
                  return
                }
                onEdit?.()
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const schedule = getScheduleForDay(day.key)
            const dayType = schedule?.day_type || "libur"

            return (
              <div key={day.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-700">{day.label}</div>

                  <div className="flex items-center gap-3">
                    <Select
                      value={dayType}
                      onValueChange={(value) => handleDayTypeChange(day.key, value as DayType)}
                      disabled={false}
                    >
                      <SelectTrigger className={`w-32 h-8 ${getDayTypeStyle(dayType)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${option.color.split(" ")[0]} border`}></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {dayType === "kerja" && schedule && (
                      <>
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          (
                          {((new Date(`2000-01-01T${schedule.end_time}`) as any) -
                            (new Date(`2000-01-01T${schedule.start_time}`) as any)) /
                            (1000 * 60 * 60)}{" "}
                          jam)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

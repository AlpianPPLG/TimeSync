"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner";

interface Schedule {
  day_of_week: string
  start_time: string
  end_time: string
  is_working_day: boolean
  day_type: "kerja" | "libur" | "cuti" | "izin" // Added day_type field
}

interface ScheduleEditorProps {
  open: boolean
  onClose: () => void
  userId?: string
  onSuccess?: () => void
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

export function ScheduleEditor({ open, onClose, userId, onSuccess }: ScheduleEditorProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchCurrentSchedule()
    }
  }, [open, userId])

  const fetchCurrentSchedule = async () => {
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
        const currentSchedules = result.data

        const initialSchedules = daysOfWeek.map((day) => {
          const existing = currentSchedules.find((s: any) => s.day_of_week === day.key)
          return (
            existing || {
              day_of_week: day.key,
              start_time: "09:00",
              end_time: "17:00",
              is_working_day: day.key !== "saturday" && day.key !== "sunday",
              day_type: day.key !== "saturday" && day.key !== "sunday" ? "kerja" : "libur",
            }
          )
        })

        setSchedules(initialSchedules)
      }
    } catch (error) {
      console.error("Error fetching current schedule:", error)
    }
  }

  const updateSchedule = (dayKey: string, field: keyof Schedule, value: any) => {
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.day_of_week === dayKey) {
          const updated = { ...schedule, [field]: value }

          // If updating is_working_day, also update day_type
          if (field === "is_working_day") {
            updated.day_type = value ? "kerja" : "libur"
          }

          // If updating day_type, also update is_working_day
          if (field === "day_type") {
            updated.is_working_day = value === "kerja"
          }

          return updated
        }
        return schedule
      }),
    )
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")

      const schedulesToSave = schedules.map((schedule) => ({
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time + ":00", // Add seconds
        end_time: schedule.end_time + ":00", // Add seconds
        day_type: schedule.day_type,
      }))

      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId || undefined,
          schedules: schedulesToSave,
        }),
      })

      if (response.ok) {
        toast("Jadwal kerja berhasil disimpan")
        onSuccess?.()
        onClose()
      } else {
        const error = await response.json()
        toast(error.error || "Gagal menyimpan jadwal")
      }
    } catch (error) {
      toast("Gagal menyimpan jadwal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Jadwal Kerja</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {daysOfWeek.map((day) => {
            const schedule = schedules.find((s) => s.day_of_week === day.key)
            if (!schedule) return null

            return (
              <div key={day.key} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{day.label}</Label>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`working-${day.key}`} className="text-sm">
                      Hari Kerja
                    </Label>
                    <Switch
                      id={`working-${day.key}`}
                      checked={schedule.is_working_day}
                      onCheckedChange={(checked) => updateSchedule(day.key, "is_working_day", checked)}
                    />
                  </div>
                </div>

                {schedule.is_working_day && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`start-${day.key}`}>Jam Masuk</Label>
                      <Input
                        id={`start-${day.key}`}
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) => updateSchedule(day.key, "start_time", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`end-${day.key}`}>Jam Pulang</Label>
                      <Input
                        id={`end-${day.key}`}
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) => updateSchedule(day.key, "end_time", e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Jadwal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

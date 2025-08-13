"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar"
import { ScheduleEditor } from "@/components/schedule/schedule-editor"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/components/auth/auth-provider"
import { Users, Clock, Calendar } from "lucide-react"

interface User {
  id: number
  employee_id: string
  name: string
  department: string
  position: string
}

export default function SchedulePage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [showEditor, setShowEditor] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers()
    }
  }, [user])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/schedule/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const result = await response.json()
        setUsers(result.data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleEditorSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const isAdmin = user?.role === "admin"
  const currentUserId = selectedUserId || user?.id?.toString()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jadwal Kerja</h1>
          <p className="text-gray-600">Kelola jadwal kerja dan jam operasional</p>
        </div>

        {/* Admin User Selection */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pilih Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Pilih karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedUserId && (
                  <Button variant="outline" onClick={() => setShowEditor(true)}>
                    Edit Jadwal
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schedule Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScheduleCalendar
              key={refreshKey}
              userId={currentUserId}
              onEdit={() => setShowEditor(true)}
              editable={!isAdmin || !!selectedUserId}
            />
          </div>

          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Ringkasan Jadwal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hari Kerja</span>
                  <span className="font-semibold">5 hari</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Jam/Minggu</span>
                  <span className="font-semibold">40 jam</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Jam Masuk</span>
                  <span className="font-semibold">09:00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Jam Pulang</span>
                  <span className="font-semibold">17:00</span>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Tips Jadwal Kerja
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Pastikan jadwal sesuai dengan kebijakan perusahaan</li>
                  <li>• Koordinasi dengan atasan untuk perubahan jadwal</li>
                  <li>• Jadwal akan mempengaruhi perhitungan absensi</li>
                  <li>• Libur nasional akan mengikuti kalender resmi</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule Editor Dialog */}
        <ScheduleEditor
          open={showEditor}
          onClose={() => setShowEditor(false)}
          userId={currentUserId}
          onSuccess={handleEditorSuccess}
        />
      </div>
    </DashboardLayout>
  )
}

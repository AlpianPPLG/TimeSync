/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { Attendance } from "@/lib/types"

interface AttendanceTableProps {
  userId?: number
  showUserInfo?: boolean
}

export function AttendanceTable({ userId, showUserInfo = false }: AttendanceTableProps) {
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  useEffect(() => {
    fetchAttendance()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters, userId])

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        month: filters.month.toString(),
        year: filters.year.toString(),
      })

      if (userId) {
        params.append("userId", userId.toString())
      }

      const response = await fetch(`/api/attendance/history?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAttendance(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching attendance:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      present: { label: "Hadir", variant: "default" as const },
      late: { label: "Terlambat", variant: "destructive" as const },
      absent: { label: "Tidak Hadir", variant: "secondary" as const },
      sick_leave: { label: "Sakit", variant: "outline" as const },
      vacation: { label: "Cuti", variant: "outline" as const },
      half_day: { label: "Setengah Hari", variant: "secondary" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatTime = (time: string | null) => {
    if (!time) return "-"
    return format(new Date(`2000-01-01 ${time}`), "HH:mm")
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: id })
  }

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Absensi
          </CardTitle>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={filters.month.toString()}
              onValueChange={(value) => setFilters({ ...filters, month: Number.parseInt(value) })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.year.toString()}
              onValueChange={(value) => setFilters({ ...filters, year: Number.parseInt(value) })}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    {showUserInfo && <TableHead>Karyawan</TableHead>}
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Total Jam</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Lokasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={showUserInfo ? 7 : 6} className="text-center py-8 text-gray-500">
                        Tidak ada data absensi
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                        {showUserInfo && (
                          <TableCell>
                            <div>
                              <p className="font-medium">{(record as any).user_name}</p>
                              <p className="text-sm text-gray-500">{(record as any).employee_id}</p>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTime(record.check_in_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {formatTime(record.check_out_time)}
                          </div>
                        </TableCell>
                        <TableCell>{record.total_hours ? `${record.total_hours} jam` : "-"}</TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {record.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-sm">{record.location}</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>

                  <span className="text-sm">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

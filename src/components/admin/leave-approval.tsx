"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Calendar, User, FileText, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { LeaveRequest } from "@/types/leave"

export function LeaveApproval() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [filters, setFilters] = useState({
    search: "",
    status: "pending",
    leave_type: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchLeaveRequests()
  }, [pagination.page, filters])

  const fetchLeaveRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status,
        leave_type: filters.leave_type,
      })

      const response = await fetch(`/api/leave-requests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLeaveRequests(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
      toast("Gagal memuat data pengajuan cuti")
    } finally {
      setLoading(false)
    }
  }

  const handleApproveLeave = async (requestId: number) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch(`/api/leave-requests/${requestId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        toast("Pengajuan cuti telah disetujui")
        fetchLeaveRequests()
        setIsDetailOpen(false)
        setSelectedRequest(null)
      } else {
        toast(result.message || "Gagal menyetujui pengajuan cuti")
      }
    } catch (error) {
      toast("Terjadi kesalahan saat menyetujui cuti")
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectLeave = async (requestId: number) => {
    if (!rejectionReason.trim()) {
      toast("Alasan penolakan harus diisi")
      return
    }

    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch(`/api/leave-requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }),
      })

      const result = await response.json()

      if (result.success) {
        toast("Pengajuan cuti telah ditolak")
        fetchLeaveRequests()
        setIsDetailOpen(false)
        setSelectedRequest(null)
        setRejectionReason("")
      } else {
        toast(result.message || "Gagal menolak pengajuan cuti")
      }
    } catch (error) {
      toast("Terjadi kesalahan saat menolak cuti")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", variant: "default" as const, icon: Clock },
      approved: { label: "Disetujui", variant: "default" as const, icon: CheckCircle },
      rejected: { label: "Ditolak", variant: "destructive" as const, icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
      icon: Clock,
    }

    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getLeaveTypeBadge = (type: string) => {
    const typeConfig = {
      sick: { label: "Sakit", variant: "secondary" as const },
      vacation: { label: "Liburan", variant: "default" as const },
      personal: { label: "Pribadi", variant: "outline" as const },
      emergency: { label: "Darurat", variant: "destructive" as const },
      maternity: { label: "Melahirkan", variant: "default" as const },
      paternity: { label: "Ayah", variant: "default" as const },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || {
      label: type,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const openDetailDialog = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setRejectionReason("")
    setIsDetailOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Persetujuan Cuti
        </CardTitle>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama karyawan atau employee ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.leave_type} onValueChange={(value) => setFilters({ ...filters, leave_type: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Jenis Cuti" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="sick">Sakit</SelectItem>
              <SelectItem value="vacation">Liburan</SelectItem>
              <SelectItem value="personal">Pribadi</SelectItem>
              <SelectItem value="emergency">Darurat</SelectItem>
              <SelectItem value="maternity">Melahirkan</SelectItem>
              <SelectItem value="paternity">Ayah</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Karyawan</TableHead>
                    <TableHead>Jenis Cuti</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Durasi</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal Pengajuan</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data pengajuan cuti
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaveRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{request.user_name}</div>
                              <div className="text-sm text-gray-500">{request.employee_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getLeaveTypeBadge(request.leave_type)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(request.start_date), "dd MMM yyyy", { locale: id })}</div>
                            <div className="text-gray-500">
                              s/d {format(new Date(request.end_date), "dd MMM yyyy", { locale: id })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.days_requested} hari</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{format(new Date(request.created_at), "dd MMM yyyy", { locale: id })}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => openDetailDialog(request)}>
                            <FileText className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
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

        {/* Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Nama Karyawan</Label>
                    <p className="text-sm font-medium">{selectedRequest.user_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Employee ID</Label>
                    <p className="text-sm font-medium">{selectedRequest.employee_id}</p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Jenis Cuti</Label>
                    <div className="mt-1">{getLeaveTypeBadge(selectedRequest.leave_type)}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Durasi</Label>
                    <p className="text-sm font-medium">{selectedRequest.days_requested} hari</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Mulai</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRequest.start_date), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Tanggal Selesai</Label>
                    <p className="text-sm font-medium">
                      {format(new Date(selectedRequest.end_date), "dd MMMM yyyy", { locale: id })}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Alasan Cuti</Label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.reason}</p>
                </div>

                {/* Current Status */}
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status Saat Ini</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>

                {/* Rejection Reason (if rejected) */}
                {selectedRequest.status === "rejected" && selectedRequest.rejection_reason && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Alasan Penolakan</Label>
                    <p className="text-sm mt-1 p-3 bg-red-50 rounded-md text-red-700">
                      {selectedRequest.rejection_reason}
                    </p>
                  </div>
                )}

                {/* Actions for pending requests */}
                {selectedRequest.status === "pending" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="rejection_reason">Alasan Penolakan (Opsional)</Label>
                      <Textarea
                        id="rejection_reason"
                        placeholder="Masukkan alasan jika ingin menolak pengajuan ini..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproveLeave(selectedRequest.id)}
                        disabled={actionLoading}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {actionLoading ? "Memproses..." : "Setujui"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectLeave(selectedRequest.id)}
                        disabled={actionLoading}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {actionLoading ? "Memproses..." : "Tolak"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Calendar, Check, X, Eye } from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { LeaveRequest } from "@/lib/types"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner";

interface LeaveRequestsTableProps {
  showAllRequests?: boolean
  onRefresh?: () => void
}

export function LeaveRequestsTable({ showAllRequests = false, onRefresh }: LeaveRequestsTableProps) {
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [statusFilter, setStatusFilter] = useState("all")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    fetchRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, statusFilter, showAllRequests])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: statusFilter,
      })

      const endpoint = showAllRequests ? "/api/leave/all" : "/api/leave/request"
      const response = await fetch(`${endpoint}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setRequests(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching leave requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (requestId: number, action: "approved" | "rejected") => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const endpoint = action === "approved" 
        ? `/api/leave-requests/${requestId}/approve`
        : `/api/leave-requests/${requestId}/reject`
      
      const body = action === "rejected" 
        ? JSON.stringify({ rejection_reason: rejectionReason })
        : null

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          ...(body && { "Content-Type": "application/json" }),
        },
        ...(body && { body }),
      })

      const result = await response.json()

      if (result.success) {
        toast(result.message)
        fetchRequests()
        setSelectedRequest(null)
        setRejectionReason("")
        onRefresh?.()
      } else {
        toast(result.message || "Terjadi kesalahan")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast("Terjadi kesalahan koneksi")
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Menunggu", variant: "secondary" as const },
      approved: { label: "Disetujui", variant: "default" as const },
      rejected: { label: "Ditolak", variant: "destructive" as const },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getLeaveTypeLabel = (type: string) => {
    const types = {
      sick: "Sakit",
      vacation: "Cuti Tahunan",
      personal: "Keperluan Pribadi",
      emergency: "Darurat",
      maternity: "Cuti Melahirkan",
      paternity: "Cuti Ayah",
    }
    return types[type as keyof typeof types] || type
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMM yyyy", { locale: id })
  }

  const canApprove = user?.role === "admin" || user?.role === "manager"

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
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
            <Calendar className="h-5 w-5" />
            {showAllRequests ? "Semua Pengajuan Cuti" : "Riwayat Pengajuan Cuti"}
          </CardTitle>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="approved">Disetujui</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {showAllRequests && <TableHead>Karyawan</TableHead>}
                <TableHead>Jenis Cuti</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Hari</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showAllRequests ? 6 : 5} className="text-center py-8 text-gray-500">
                    Tidak ada pengajuan cuti
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    {showAllRequests && (
                      <TableCell>
                        <div>
                          <p className="font-medium">{(request as any).user_name}</p>
                          <p className="text-sm text-gray-500">{(request as any).employee_id}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{getLeaveTypeLabel(request.leave_type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(request.start_date)}</p>
                        <p className="text-gray-500">s/d {formatDate(request.end_date)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{request.days_requested} hari</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Detail Pengajuan Cuti</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {showAllRequests && (
                                <div>
                                  <Label>Karyawan</Label>
                                  <p className="text-sm">
                                    {(request as any).user_name} ({(request as any).employee_id})
                                  </p>
                                </div>
                              )}
                              <div>
                                <Label>Jenis Cuti</Label>
                                <p className="text-sm">{getLeaveTypeLabel(request.leave_type)}</p>
                              </div>
                              <div>
                                <Label>Periode</Label>
                                <p className="text-sm">
                                  {formatDate(request.start_date)} - {formatDate(request.end_date)} (
                                  {request.days_requested} hari)
                                </p>
                              </div>
                              <div>
                                <Label>Alasan</Label>
                                <p className="text-sm">{request.reason}</p>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="mt-1">{getStatusBadge(request.status)}</div>
                              </div>
                              {request.approved_by && (
                                <div>
                                  <Label>Disetujui oleh</Label>
                                  <p className="text-sm">{request.approved_by}</p>
                                </div>
                              )}
                              {request.rejection_reason && (
                                <div>
                                  <Label>Alasan Penolakan</Label>
                                  <p className="text-sm text-red-600">{request.rejection_reason}</p>
                                </div>
                              )}

                              {canApprove && request.status === "pending" && (
                                <div className="flex gap-2 pt-4">
                                  <Button
                                    onClick={() => handleApproval(request.id, "approved")}
                                    disabled={actionLoading}
                                    size="sm"
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Setujui
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <X className="h-3 w-3 mr-1" />
                                        Tolak
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Tolak Pengajuan Cuti</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="rejection_reason">Alasan Penolakan</Label>
                                          <Textarea
                                            id="rejection_reason"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="Jelaskan alasan penolakan..."
                                            rows={3}
                                          />
                                        </div>
                                        <Button
                                          onClick={() => handleApproval(request.id, "rejected")}
                                          disabled={actionLoading || !rejectionReason.trim()}
                                          variant="destructive"
                                          className="w-full"
                                        >
                                          {actionLoading ? "Memproses..." : "Konfirmasi Penolakan"}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
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
      </CardContent>
    </Card>
  )
}

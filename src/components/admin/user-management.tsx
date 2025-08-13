/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Users, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { User } from "@/lib/types"

const userSchema = z.object({
  employee_id: z.string().min(1, "Employee ID wajib diisi"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().optional(),
  role: z.enum(["admin", "employee", "manager"]),
  department: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean().optional(),
})

type UserFormData = z.infer<typeof userSchema>

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    role: "",
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  useEffect(() => {
    fetchUsers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        department: filters.department,
        role: filters.role,
      })

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.data)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (data: UserFormData) => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message,
        })
        setIsCreateOpen(false)
        reset()
        fetchUsers()
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateUser = async (data: UserFormData) => {
    if (!selectedUser) return

    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message,
        })
        setIsEditOpen(false)
        setSelectedUser(null)
        reset()
        fetchUsers()
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return

    setActionLoading(true)
    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message,
        })
        fetchUsers()
      } else {
        toast({
          title: "Gagal",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan koneksi",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setValue("employee_id", user.employee_id)
    setValue("name", user.name)
    setValue("email", user.email)
    setValue("role", user.role)
    setValue("department", user.department || "")
    setValue("position", user.position || "")
    setValue("phone", user.phone || "")
    setValue("address", user.address || "")
    setValue("is_active", user.is_active)
    setIsEditOpen(true)
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: "Admin", variant: "destructive" as const },
      manager: { label: "Manager", variant: "default" as const },
      employee: { label: "Employee", variant: "secondary" as const },
    }

    const config = roleConfig[role as keyof typeof roleConfig] || {
      label: role,
      variant: "secondary" as const,
    }

    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const UserForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit(isEdit ? handleUpdateUser : handleCreateUser)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee_id">Employee ID</Label>
          <Input id="employee_id" {...register("employee_id")} className={errors.employee_id ? "border-red-500" : ""} />
          {errors.employee_id && <p className="text-sm text-red-500">{errors.employee_id.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} className={errors.email ? "border-red-500" : ""} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{isEdit ? "Password Baru (Kosongkan jika tidak diubah)" : "Password"}</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select onValueChange={(value) => setValue("role", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Departemen</Label>
          <Input id="department" {...register("department")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">Posisi</Label>
          <Input id="position" {...register("position")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Telepon</Label>
          <Input id="phone" {...register("phone")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Alamat</Label>
        <Input id="address" {...register("address")} />
      </div>

      {isEdit && (
        <div className="space-y-2">
          <Label htmlFor="is_active">Status</Label>
          <Select onValueChange={(value) => setValue("is_active", value === "true")}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Aktif</SelectItem>
              <SelectItem value="false">Tidak Aktif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={actionLoading}>
        {actionLoading ? "Memproses..." : isEdit ? "Update User" : "Tambah User"}
      </Button>
    </form>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manajemen User
          </CardTitle>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Tambah User Baru</DialogTitle>
              </DialogHeader>
              <UserForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, email, atau employee ID..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          <Select value={filters.department} onValueChange={(value) => setFilters({ ...filters, department: value })}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Departemen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="IT">IT</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.role} onValueChange={(value) => setFilters({ ...filters, role: value })}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
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
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Departemen</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada data user
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.employee_id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.department || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
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
          </>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <UserForm isEdit />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
function useToast(): { toast: any } {
  throw new Error("Function not implemented.")
}


/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Plus } from "lucide-react"
import { toast } from "sonner"
import { format, differenceInDays } from "date-fns"

const leaveRequestSchema = z
  .object({
    leave_type: z.enum(["sick", "vacation", "personal", "emergency", "maternity", "paternity"]),
    start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
    end_date: z.string().min(1, "Tanggal akhir wajib diisi"),
    reason: z.string().min(10, "Alasan minimal 10 karakter"),
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: "Tanggal akhir harus setelah atau sama dengan tanggal mulai",
    path: ["end_date"],
  })

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>

interface LeaveRequestFormProps {
  onSuccess?: () => void
}

export function LeaveRequestForm({ onSuccess }: LeaveRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
  })

  const startDate = watch("start_date")
  const endDate = watch("end_date")

  const calculateDays = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      return differenceInDays(end, start) + 1
    }
    return 0
  }

  const onSubmit = async (data: LeaveRequestFormData) => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("attendance_token")
      const response = await fetch("/api/leave/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(result.message)
        toast.success(result.message)
        reset()
        onSuccess?.()
      } else {
        setError(result.message)
        toast.error(result.message)
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorMessage = "Terjadi kesalahan koneksi"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const leaveTypes = [
    { value: "sick", label: "Sakit" },
    { value: "vacation", label: "Cuti Tahunan" },
    { value: "personal", label: "Keperluan Pribadi" },
    { value: "emergency", label: "Darurat" },
    { value: "maternity", label: "Cuti Melahirkan" },
    { value: "paternity", label: "Cuti Ayah" },
  ]

  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ajukan Cuti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="leave_type">Jenis Cuti</Label>
            <Select onValueChange={(value) => setValue("leave_type", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis cuti" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leave_type && <p className="text-sm text-red-500">{errors.leave_type.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Tanggal Mulai</Label>
              <Input
                id="start_date"
                type="date"
                min={today}
                {...register("start_date")}
                className={errors.start_date ? "border-red-500" : ""}
              />
              {errors.start_date && <p className="text-sm text-red-500">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Tanggal Akhir</Label>
              <Input
                id="end_date"
                type="date"
                min={startDate || today}
                {...register("end_date")}
                className={errors.end_date ? "border-red-500" : ""}
              />
              {errors.end_date && <p className="text-sm text-red-500">{errors.end_date.message}</p>}
            </div>
          </div>

          {startDate && endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <Calendar className="inline h-4 w-4 mr-1" />
                Total hari cuti: <strong>{calculateDays()} hari</strong>
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Cuti</Label>
            <Textarea
              id="reason"
              placeholder="Jelaskan alasan pengajuan cuti..."
              rows={4}
              {...register("reason")}
              className={errors.reason ? "border-red-500" : ""}
            />
            {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Memproses...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajukan Cuti
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

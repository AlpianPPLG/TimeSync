/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Filter } from "lucide-react"
import { format } from "date-fns"
import { useAuth } from "@/components/auth/auth-provider"

interface ReportFiltersProps {
  onFilterChange: (filters: any) => void
  onExport: (format: string) => void
  reportType: "attendance" | "leave"
}

export function ReportFilters({ onFilterChange, onExport, reportType }: ReportFiltersProps) {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    start_date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), "yyyy-MM-dd"),
    end_date: format(new Date(), "yyyy-MM-dd"),
    user_id: "",
    department: "all", // Updated default value to "all"
    status: "all", // Updated default value to "all"
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const departments = ["IT", "HR", "Finance", "Marketing", "Operations"]
  const leaveStatuses = ["pending", "approved", "rejected"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Laporan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Tanggal Mulai</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange("start_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_date">Tanggal Akhir</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange("end_date", e.target.value)}
            />
          </div>
        </div>

        {/* Admin-only filters */}
        {user?.role === "admin" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Departemen</Label>
              <Select value={filters.department} onValueChange={(value) => handleFilterChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Departemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Departemen</SelectItem> {/* Updated value to "all" */}
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reportType === "leave" && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem> {/* Updated value to "all" */}
                    {leaveStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "pending"
                          ? "Menunggu"
                          : status === "approved"
                            ? "Disetujui"
                            : status === "rejected"
                              ? "Ditolak"
                              : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Export Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button onClick={() => onExport("csv")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => onExport("excel")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

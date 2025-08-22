/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface AttendanceChartProps {
  dailyData: any[]
  statusData: any[]
}

export function AttendanceChart({ dailyData, statusData }: AttendanceChartProps) {
  const COLORS = {
    present: "#10b981",
    late: "#f59e0b",
    absent: "#ef4444",
    sick_leave: "#8b5cf6",
    vacation: "#06b6d4",
  }

  const statusLabels = {
    present: "Hadir",
    late: "Terlambat",
    absent: "Tidak Hadir",
    sick_leave: "Sakit",
    vacation: "Cuti",
  }

  const formattedStatusData = statusData.map((item) => ({
    ...item,
    name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
    fill: COLORS[item.status as keyof typeof COLORS] || "#6b7280",
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Daily Attendance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Tren Kehadiran Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present_count" fill="#10b981" name="Hadir" />
              <Bar dataKey="late_count" fill="#f59e0b" name="Terlambat" />
              <Bar dataKey="absent_count" fill="#ef4444" name="Tidak Hadir" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Status Kehadiran</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formattedStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {formattedStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

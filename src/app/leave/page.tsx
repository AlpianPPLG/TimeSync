"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LeaveRequestForm } from "@/components/leave/leave-request-form"
import { LeaveRequestsTable } from "@/components/leave/leave-requests-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeavePage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Cuti</h1>
          <p className="text-gray-600">Ajukan cuti dan kelola riwayat pengajuan cuti Anda</p>
        </div>

        <Tabs defaultValue="request" className="space-y-6">
          <TabsList>
            <TabsTrigger value="request">Ajukan Cuti</TabsTrigger>
            <TabsTrigger value="history">Riwayat Cuti</TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaveRequestForm onSuccess={handleFormSuccess} />

              {/* Leave Balance Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Saldo Cuti</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">12</p>
                      <p className="text-sm text-gray-600">Sisa Cuti Tahunan</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">3</p>
                      <p className="text-sm text-gray-600">Cuti Terpakai</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips Pengajuan Cuti</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Ajukan cuti minimal 3 hari sebelum tanggal yang diinginkan</li>
                    <li>• Pastikan alasan cuti jelas dan detail</li>
                    <li>• Koordinasi dengan tim sebelum mengajukan cuti</li>
                    <li>• Cek saldo cuti yang tersedia</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <LeaveRequestsTable key={refreshKey} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

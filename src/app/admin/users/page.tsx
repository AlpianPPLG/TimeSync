import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserManagement } from "@/components/admin/user-management"
import { LeaveApproval } from "@/components/admin/leave-approval"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminUsersPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-600">Kelola data karyawan dan persetujuan cuti</p>
        </div>

        {/* Tabs for User Management and Leave Approval */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Manajemen User</TabsTrigger>
            <TabsTrigger value="leave-approval">Persetujuan Cuti</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="leave-approval">
            <LeaveApproval />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

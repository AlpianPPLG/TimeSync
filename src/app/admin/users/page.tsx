import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminUsersPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-600">Tambah, edit, dan kelola data karyawan</p>
        </div>

        {/* User Management */}
        <UserManagement />
      </div>
    </DashboardLayout>
  )
}

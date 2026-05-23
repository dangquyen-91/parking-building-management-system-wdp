import { AdminPageShell } from '../components/admin/AdminPageShell'

export function UserManagementPage() {
  return (
    <AdminPageShell
      eyebrow="Admin // Users"
      title="User Management"
      description="Manage tenants, security staff, and access roles across your property."
    />
  )
}

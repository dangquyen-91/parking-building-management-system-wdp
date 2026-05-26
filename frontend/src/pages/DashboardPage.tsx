import { AdminPageShell } from '../components/admin/AdminPageShell'

export function DashboardPage() {
  return (
    <AdminPageShell
      eyebrow="Admin // Dashboard"
      title="Dashboard"
      description="Overview of occupancy, gate activity, and building parking operations."
    />
  )
}

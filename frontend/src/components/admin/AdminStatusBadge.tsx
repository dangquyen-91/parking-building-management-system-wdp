import { adminStatusTone, type AdminStatus } from './adminData'

type AdminStatusBadgeProps = {
  status: AdminStatus
  label?: string
}

export function AdminStatusBadge({ status, label = status }: AdminStatusBadgeProps) {
  return (
    <span className={['rounded-full border px-2 py-1 text-[10px] font-medium uppercase tracking-wide', adminStatusTone[status]].join(' ')}>
      {label}
    </span>
  )
}

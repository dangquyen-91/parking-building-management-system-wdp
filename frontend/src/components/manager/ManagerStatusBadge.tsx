import { statusTone } from './managerData'

type ManagerStatusBadgeProps = {
  status: keyof typeof statusTone
  label?: string
}

export function ManagerStatusBadge({ status, label = status }: ManagerStatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-sm ${statusTone[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}


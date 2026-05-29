import { statusTone } from './managerData'

type ManagerStatusBadgeProps = {
  status: keyof typeof statusTone
  label?: string
}

export function ManagerStatusBadge({ status, label = status }: ManagerStatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${statusTone[status]}`}>
      {label}
    </span>
  )
}


import { statusTone } from '../managerUi'

type ManagerStatusBadgeProps = {
  status: keyof typeof statusTone
  label?: string
}

export function ManagerStatusBadge({ status, label = status }: ManagerStatusBadgeProps) {
  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black shadow-sm ring-1 ring-white/10 ${statusTone[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" aria-hidden="true" />
      {label}
    </span>
  )
}





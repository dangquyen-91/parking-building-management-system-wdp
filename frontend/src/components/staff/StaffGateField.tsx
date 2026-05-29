import type { ReactNode } from 'react'

type StaffGateFieldProps = {
  label: string
  children: ReactNode
}

export function StaffGateField({ label, children }: StaffGateFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</span>
      {children}
    </label>
  )
}


import type { ReactNode } from 'react'
import { Label } from '../../ui/label'

type StaffGateFieldProps = {
  label: string
  children: ReactNode
}

export function StaffGateField({ label, children }: StaffGateFieldProps) {
  return (
    <Label className="grid gap-2 text-xs font-medium text-muted-foreground">
      {label}
      {children}
    </Label>
  )
}

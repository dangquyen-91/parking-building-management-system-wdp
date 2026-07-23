/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { GateUser } from '../../../services/staffGateApi'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'

export const operationInputClass = 'border-input bg-transparent h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

export function OperationField({ label, children }: { label: string; children: ReactNode }) {
  return <Label className="grid gap-2 text-xs text-muted-foreground">{label}{children}</Label>
}

export function OperationEmpty({ text }: { text: string }) {
  return <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">{text}</CardContent></Card>
}

export function OperationListShell({ eyebrow, title, count, children, tone = 'default' }: { eyebrow: string; title: string; count: string; children: ReactNode; tone?: 'default' | 'booking' | 'gate' }) {
  const toneClass = tone === 'booking'
    ? 'border-violet-500/20 bg-violet-500/5'
    : tone === 'gate'
      ? 'border-emerald-500/20 bg-emerald-500/5'
      : 'border-sky-500/15 bg-card'

  return <Card className={toneClass}><CardHeader className="flex-row items-center justify-between gap-3 space-y-0"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p><CardTitle className="mt-1 break-words text-lg">{title}</CardTitle></div><Badge variant="secondary" className="shrink-0">{count}</Badge></CardHeader><CardContent className="grid gap-3">{children}</CardContent></Card>
}

export function OperationInfoCell({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) {
  return <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-background/55 p-3"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 break-words text-foreground ${strong ? 'font-black' : 'font-semibold'}`}>{value}</p>{detail && <p className="mt-1 break-words text-xs text-muted-foreground">{detail}</p>}</div>
}

export function OperationValue({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={`mt-1 break-words text-foreground ${strong ? 'text-lg font-semibold' : 'font-medium'}`}>{value}</dd>{detail && <p className="mt-1 break-words text-xs text-muted-foreground">{detail}</p>}</div>
}

export function formatOperationDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

export function formatOperationDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '-'
}

export function getOperationStaffName(staff?: GateUser | string | null) {
  return !staff ? 'Không xác định' : typeof staff === 'string' ? staff : staff.fullName || staff.email || 'Không xác định'
}


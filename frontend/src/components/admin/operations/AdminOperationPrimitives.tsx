/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import type { GateUser } from '../../../services/staffGateApi'

export const operationInputClass = 'h-10 min-w-0 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary'

export function OperationField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1 text-xs font-medium text-subtle">{label}{children}</label>
}

export function OperationEmpty({ text }: { text: string }) {
  return <div className="liquid-glass-card rounded-2xl border border-dashed border-theme p-8 text-center text-sm text-muted">{text}</div>
}

export function OperationListShell({ eyebrow, title, count, children, tone = 'default' }: { eyebrow: string; title: string; count: string; children: ReactNode; tone?: 'default' | 'booking' | 'gate' }) {
  const accent = tone === 'booking' ? 'from-violet-500 via-fuchsia-500 to-amber-400' : tone === 'gate' ? 'from-emerald-500 via-cyan-400 to-sky-500' : 'from-violet-500 via-sky-500 to-emerald-500'
  const label = tone === 'gate' ? 'text-emerald-600 dark:text-emerald-300' : tone === 'booking' ? 'text-violet-600 dark:text-violet-300' : 'text-subtle'
  return <section className="liquid-glass-card rounded-2xl border border-theme p-4 shadow-sm md:p-5"><span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} /><div className="mb-4 flex items-center justify-between gap-3"><div><p className={`text-[10px] font-black uppercase tracking-[0.18em] ${label}`}>{eyebrow}</p><h2 className="mt-1 text-lg font-black text-fg">{title}</h2></div><span className="rounded-full border border-theme bg-page/40 px-3 py-1 text-xs font-bold text-subtle">{count}</span></div><div className="grid gap-3">{children}</div></section>
}

export function OperationInfoCell({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) {
  return <div className="flex min-h-20 min-w-0 flex-col justify-center rounded-xl bg-page/45 p-3"><p className="text-xs text-subtle">{label}</p><p className={`mt-1 truncate text-fg ${strong ? 'font-black' : 'font-semibold'}`}>{value}</p>{detail && <p className="mt-1 truncate text-xs text-muted">{detail}</p>}</div>
}

export function OperationValue({ label, value, detail, strong = false }: { label: string; value: string | number; detail?: string; strong?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs text-subtle">{label}</dt><dd className={`mt-1 truncate text-fg ${strong ? 'text-lg font-semibold' : 'font-medium'}`}>{value}</dd>{detail && <p className="mt-1 truncate text-xs text-muted">{detail}</p>}</div>
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

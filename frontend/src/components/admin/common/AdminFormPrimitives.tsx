import type { ReactNode } from 'react'

export const adminInputClass =
  'h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15'

export function AdminField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-1 text-xs font-medium text-subtle">{label}{children}</label>
}

export function AdminModal({
  eyebrow,
  title,
  error,
  onClose,
  children,
}: {
  eyebrow: string
  title: string
  error?: string | null
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-overlay p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="liquid-glass-card max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-sky-500/15 p-5 shadow-2xl md:p-6">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
        <div className="mb-5 flex justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-black text-fg">{title}</h2>
          </div>
          <button type="button" className="flex size-10 items-center justify-center rounded-xl border border-theme text-muted transition hover:bg-ghost hover:text-fg" onClick={onClose} aria-label="Đóng">✕</button>
        </div>
        {error && <p className="mb-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
        {children}
      </div>
    </div>
  )
}

export function AdminModalActions({ disabled, loading, onClose }: { disabled: boolean; loading: boolean; onClose: () => void }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row">
      <button type="button" className="h-11 rounded-xl border border-theme px-4 text-sm font-bold text-fg transition hover:bg-ghost" onClick={onClose}>Hủy</button>
      <button className="h-11 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-5 text-sm font-black text-white shadow-lg shadow-sky-500/20 transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0" disabled={disabled}>
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </div>
  )
}

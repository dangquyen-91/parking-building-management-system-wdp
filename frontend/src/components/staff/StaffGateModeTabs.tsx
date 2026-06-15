export type StaffGateMode = 'checkin' | 'checkout'

type StaffGateModeTabsProps = {
  mode: StaffGateMode
  onModeChange: (mode: StaffGateMode) => void
}

const gateModes = [
  {
    value: 'checkin',
    label: 'Xe vào',
    description: 'Tra cứu và cấp vị trí',
    number: '01',
    accent: 'bg-emerald-500',
  },
  {
    value: 'checkout',
    label: 'Xe ra',
    description: 'Tính phí và thanh toán',
    number: '02',
    accent: 'bg-amber-500',
  },
] as const

export function StaffGateModeTabs({ mode, onModeChange }: StaffGateModeTabsProps) {
  return (
    <div className="mb-6 grid gap-2 rounded-2xl border border-theme bg-badge p-2 sm:grid-cols-2">
      {gateModes.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onModeChange(item.value)}
          className={[
            'group flex min-h-16 items-center gap-3 rounded-xl border px-4 text-left transition-all',
            mode === item.value
              ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg'
              : 'border-transparent text-muted hover:border-theme hover:bg-ghost hover:text-fg',
          ].join(' ')}
        >
          <span className={[
            'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white',
            item.accent,
          ].join(' ')}>
            {item.number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold">{item.label}</span>
            <span className="mt-0.5 block text-xs opacity-70">{item.description}</span>
          </span>
          <span className="text-lg opacity-50 transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      ))}
    </div>
  )
}

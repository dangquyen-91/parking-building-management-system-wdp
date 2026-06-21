export type StaffGateMode = 'checkin' | 'checkout'

type StaffGateModeTabsProps = {
  mode: StaffGateMode
  onModeChange: (mode: StaffGateMode) => void
}

const gateModes = [
  {
    value: 'checkin',
    label: 'Xe vào',
    description: 'Quét biển số, xác minh QR và ghi nhận xe vào bãi',
    number: '01',
    accent: 'from-emerald-500 to-sky-500',
  },
  {
    value: 'checkout',
    label: 'Xe ra',
    description: 'Tra cứu xe, tính phí và hoàn tất thanh toán',
    number: '02',
    accent: 'from-amber-500 to-orange-500',
  },
] as const

export function StaffGateModeTabs({ mode, onModeChange }: StaffGateModeTabsProps) {
  return (
    <div className="mb-6 grid gap-3 rounded-[1.75rem] border border-theme bg-badge p-2 shadow-sm sm:grid-cols-2">
      {gateModes.map((item) => {
        const active = mode === item.value

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onModeChange(item.value)}
            className={[
              'group relative overflow-hidden rounded-2xl border p-4 text-left transition-all',
              active
                ? 'border-transparent bg-btn-primary text-btn-primary-fg shadow-xl'
                : 'border-theme bg-page/60 text-muted hover:bg-ghost hover:text-fg',
            ].join(' ')}
          >
            <div
              className={[
                'absolute inset-y-0 left-0 w-1 bg-gradient-to-b',
                active ? item.accent : 'from-transparent to-transparent',
              ].join(' ')}
            />
            <div className="flex items-center gap-3">
              <span
                className={[
                  'flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-xs font-black text-white shadow-lg',
                  item.accent,
                ].join(' ')}
              >
                {item.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-black">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 opacity-75">{item.description}</span>
              </span>
              <span className="text-xl opacity-60 transition-transform group-hover:translate-x-1">→</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export type StaffGateMode = 'checkin' | 'checkout'

type StaffGateModeTabsProps = {
  mode: StaffGateMode
  onModeChange: (mode: StaffGateMode) => void
}

const gateModes = [
  { value: 'checkin', label: 'Xe vao' },
  { value: 'checkout', label: 'Xe ra' },
] as const

export function StaffGateModeTabs({ mode, onModeChange }: StaffGateModeTabsProps) {
  return (
    <div className="mb-5 grid rounded-lg border border-theme bg-badge p-1 sm:inline-grid sm:grid-cols-2">
      {gateModes.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onModeChange(item.value)}
          className={[
            'h-10 rounded-md px-5 text-sm font-semibold transition-colors',
            mode === item.value
              ? 'bg-btn-primary text-btn-primary-fg'
              : 'text-muted hover:bg-ghost hover:text-fg',
          ].join(' ')}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

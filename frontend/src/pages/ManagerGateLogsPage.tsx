import {
  MANAGER_GATE_LOGS,
  ManagerPageHeader,
  ManagerStatusBadge,
  formatCurrency,
} from '../components/manager'

export function ManagerGateLogsPage() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Gate Logs"
        title="Gate Activity"
        description="Xem lich su check-in/check-out tu staff theo bien so, loai khach, gio xu ly va phi thu."
      />

      <section className="liquid-glass-card rounded-lg p-4 md:p-5">
        <div className="grid gap-3">
          {MANAGER_GATE_LOGS.map((log) => (
            <div key={log.id} className="grid gap-4 rounded-lg border border-theme bg-badge p-4 md:grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr] md:items-center">
              <div>
                <p className="font-semibold text-fg">{log.plate}</p>
                <p className="mt-1 text-xs text-subtle">{log.id}</p>
              </div>
              <p className="text-sm text-muted">{log.visitorType}</p>
              <p className="text-sm text-muted">{log.staff}</p>
              <div>
                <p className="text-xs text-subtle">Time</p>
                <p className="mt-1 text-sm font-medium text-fg">{log.time}</p>
              </div>
              <div className="flex flex-col gap-2">
                <ManagerStatusBadge status={log.action} />
                <span className="text-xs text-muted">{formatCurrency(log.fee)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


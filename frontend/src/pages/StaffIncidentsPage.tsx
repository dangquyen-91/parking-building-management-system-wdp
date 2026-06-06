import {
  STAFF_INCIDENTS,
  StaffPageHeader,
  formatGateTime,
  incidentStatusClass,
  incidentStatusLabel,
} from '../components/staff'

export function StaffIncidentsPage() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Staff // Incidents"
        title="Incident Report"
        description="Ghi nhan cac su co trong ca truc de manager theo doi va xu ly tiep."
        actions={
          <button
            type="button"
            className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            Tao incident
          </button>
        }
      />

      <section className="grid gap-3">
        {STAFF_INCIDENTS.map((incident) => (
          <article key={incident.id} className="liquid-glass-card rounded-lg p-4 md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-fg">{incident.title}</p>
                <p className="mt-1 text-xs text-subtle">{incident.id} / {incident.category} / {formatGateTime(incident.reportedAt)}</p>
              </div>
              <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium ${incidentStatusClass[incident.status]}`}>
                {incidentStatusLabel[incident.status]}
              </span>
            </div>
            <div className="mt-4 rounded-lg border border-theme bg-badge p-3">
              <p className="text-xs text-subtle">Bien so</p>
              <p className="mt-1 text-sm font-semibold text-fg">{incident.plate}</p>
              <p className="mt-3 text-sm text-muted">{incident.note}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}


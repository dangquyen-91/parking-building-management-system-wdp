import type { FormEvent } from 'react'
import { STAFF_ZONES, visitorTypeLabel, type ParkingTicket, type VisitorType } from './staffGateData'
import { StaffGateField } from './StaffGateField'

type StaffCheckInPanelProps = {
  plate: string
  visitorType: VisitorType
  zoneId: string
  note: string
  onPlateChange: (value: string) => void
  onVisitorTypeChange: (value: VisitorType) => void
  onZoneChange: (value: string) => void
  onNoteChange: (value: string) => void
  onCreateTicket: (ticket: ParkingTicket) => void
}

export function StaffCheckInPanel({
  plate,
  visitorType,
  zoneId,
  note,
  onPlateChange,
  onVisitorTypeChange,
  onZoneChange,
  onNoteChange,
  onCreateTicket,
}: StaffCheckInPanelProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const zone = STAFF_ZONES.find((item) => item.id === zoneId) ?? STAFF_ZONES[0]
    const normalizedPlate = plate.trim().toUpperCase()
    const ticketNumber = Math.floor(1000 + Math.random() * 9000)

    onCreateTicket({
      id: `PK-MOTO-${ticketNumber}`,
      plate: normalizedPlate,
      visitorType,
      vehicleType: 'Motorbike',
      slot: `${zone.label.split(' - ')[0]}-${zone.label.endsWith('Zone A') ? 'A' : 'B'}-${ticketNumber
        .toString()
        .slice(-2)}`,
      zone: zone.label,
      checkInAt: new Date().toISOString(),
      status: 'active',
      note: note.trim() || undefined,
    })
  }

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-2 border-b border-theme pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Xe vao</p>
        <h2 className="text-xl font-semibold text-fg">Tao ve gui xe may</h2>
        <p className="text-sm text-muted">
          Staff ghi nhan bien so, loai khach va khu de xe. Du lieu hien chi nam tren frontend.
        </p>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <StaffGateField label="Bien so xe">
          <input
            required
            value={plate}
            onChange={(event) => onPlateChange(event.target.value)}
            placeholder="VD: 59X2-481.22"
            className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
          />
        </StaffGateField>

        <div className="grid gap-3 sm:grid-cols-2">
          {(['walkIn', 'user'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onVisitorTypeChange(type)}
              className={[
                'min-h-20 rounded-lg border px-4 text-left transition-colors',
                visitorType === type
                  ? 'border-theme-strong bg-btn-primary text-btn-primary-fg'
                  : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
              ].join(' ')}
            >
              <span className="block text-sm font-semibold">{visitorTypeLabel[type]}</span>
              <span className="mt-1 block text-xs opacity-75">
                {type === 'walkIn' ? 'Khach chi den gui xe va lay luc nao cung duoc' : 'Khach co tai khoan trong he thong'}
              </span>
            </button>
          ))}
        </div>

        <StaffGateField label="Khu de xe">
          <select
            value={zoneId}
            onChange={(event) => onZoneChange(event.target.value)}
            className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
          >
            {STAFF_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label} - con {zone.available}/{zone.total}
              </option>
            ))}
          </select>
        </StaffGateField>

        <StaffGateField label="Ghi chu">
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            placeholder="VD: mu bao hiem, the tam, tinh trang xe..."
            className="auth-input resize-none rounded-lg border px-3 py-3 text-sm text-fg"
          />
        </StaffGateField>

        <button
          type="submit"
          className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
        >
          Check-in xe vao
        </button>
      </form>
    </section>
  )
}


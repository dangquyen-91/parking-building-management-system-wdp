import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { UserVehicle } from '../../../services/authApi'
import type { VehicleType } from '../../../services/userSubscriptionApi'
import { VEHICLE_LABELS } from '../../../utils/subscriptionUi'

type ResidentSubscriptionFormProps = {
  vehicleType: VehicleType
  licensePlate: string
  onVehicleTypeChange: (value: VehicleType) => void
  onLicensePlateChange: (value: string) => void
  registeredVehicles: UserVehicle[]
  lockedVehicleType?: boolean
  selectedPlanName?: string
}

export function ResidentSubscriptionForm({
  vehicleType,
  licensePlate,
  onVehicleTypeChange,
  onLicensePlateChange,
  registeredVehicles,
  lockedVehicleType = false,
  selectedPlanName,
}: ResidentSubscriptionFormProps) {
  const [isVehicleListOpen, setIsVehicleListOpen] = useState(false)
  const comboboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!comboboxRef.current?.contains(event.target as Node)) {
        setIsVehicleListOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <section className="liquid-glass-card !overflow-visible rounded-2xl">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/15 via-transparent to-transparent p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
            1
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thông tin xe</p>
            <h2 className="mt-1 text-xl font-bold text-fg">
              {lockedVehicleType ? 'Chọn biển số xe' : 'Chọn phương tiện đăng ký'}
            </h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          {lockedVehicleType
            ? 'Gói và loại xe đã được chọn sẵn. Nhập biển số mới hoặc chọn một biển số đã lưu để tiếp tục.'
            : 'Chọn loại phương tiện, sau đó nhập hoặc chọn biển số để xem các gói cư dân phù hợp.'}
        </p>
      </div>

      <div className="grid gap-6 p-5 md:p-6">
        {lockedVehicleType ? (
          <div className="rounded-xl border border-theme bg-badge p-4 text-sm text-muted">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Gói đã chọn</span>
            <span className="mt-2 block text-base font-bold text-fg">{selectedPlanName || 'Gói cư dân'}</span>
            <span className="mt-1 block text-xs">Loại xe: {VEHICLE_LABELS[vehicleType]}</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(['motorcycle', 'car'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={[
                  'min-h-24 rounded-xl border p-4 text-left text-sm transition-all',
                  vehicleType === type
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg'
                    : 'border-theme bg-badge text-muted hover:-translate-y-0.5 hover:bg-ghost hover:text-fg',
                ].join(' ')}
                onClick={() => onVehicleTypeChange(type)}
              >
                <span className="block text-base font-bold">{VEHICLE_LABELS[type]}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {type === 'car' ? 'Giữ ô đỗ cố định' : 'Dùng sức chứa chung'}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          <label htmlFor="subscription-license-plate">Biển số xe</label>
          <div ref={comboboxRef} className="relative">
            <input
              id="subscription-license-plate"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isVehicleListOpen}
              aria-controls="registered-license-plates"
              className="auth-input h-14 w-full rounded-xl border px-4 pr-14 text-base font-black uppercase tracking-[0.08em] text-fg placeholder:font-semibold placeholder:tracking-normal placeholder:text-subtle"
              value={licensePlate}
              onChange={(event) => onLicensePlateChange(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') setIsVehicleListOpen(true)
                if (event.key === 'Escape') setIsVehicleListOpen(false)
              }}
              placeholder="Nhập hoặc chọn biển số xe"
              autoComplete="off"
              required
            />
            <button
              type="button"
              aria-label="Mở danh sách biển số đã lưu"
              aria-expanded={isVehicleListOpen}
              onClick={() => setIsVehicleListOpen((open) => !open)}
              className="absolute inset-y-0 right-0 flex w-14 items-center justify-center rounded-r-xl text-muted transition-colors hover:bg-ghost hover:text-fg"
            >
              <ChevronDown className={`size-5 transition-transform ${isVehicleListOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isVehicleListOpen && (
              <div
                id="registered-license-plates"
                role="listbox"
                className="absolute top-full z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-theme-strong bg-surface p-1.5 text-fg shadow-2xl"
              >
                {registeredVehicles.length > 0 ? registeredVehicles.map((vehicle) => (
                  <button
                    key={vehicle._id}
                    type="button"
                    role="option"
                    aria-selected={licensePlate === vehicle.licensePlate}
                    onClick={() => {
                      onLicensePlateChange(vehicle.licensePlate)
                      setIsVehicleListOpen(false)
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors hover:bg-ghost"
                  >
                    <span className="font-black uppercase tracking-[0.08em]">{vehicle.licensePlate}</span>
                    <span className="text-xs font-normal normal-case tracking-normal text-muted">{VEHICLE_LABELS[vehicle.vehicleType]}</span>
                  </button>
                )) : (
                  <p className="px-4 py-3 text-xs font-normal normal-case tracking-normal text-muted">Chưa có biển số phù hợp đã lưu.</p>
                )}
              </div>
            )}
          </div>
          <span className="text-[11px] font-normal normal-case tracking-normal text-muted">
            Nhập biển số mới hoặc chọn một biển số {VEHICLE_LABELS[vehicleType].toLowerCase()} đã lưu từ danh sách gợi ý.
          </span>
        </div>
      </div>
    </section>
  )
}

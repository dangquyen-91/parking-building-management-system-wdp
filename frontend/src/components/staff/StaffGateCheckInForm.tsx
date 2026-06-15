import type {
  GateCustomerType,
  GateLookupResult,
  GateVehicleType,
} from '../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../utils/staffGateAllocation'
import { StaffAssignedParking } from './StaffAssignedParking'
import { StaffGateCameraScanner } from './StaffGateCameraScanner'
import { StaffGateField } from './StaffGateField'
import {
  formatCustomerType,
  formatVehicleType,
  normalizePlate,
} from './staffGateUtils'

type StaffGateCheckInFormProps = {
  plate: string
  vehicleType: GateVehicleType
  note: string
  lookupResult: GateLookupResult | null
  lookupMatchesPlate: boolean
  checkInCustomerType?: GateCustomerType
  floorOptions: StaffGateFloorOption[]
  selectedFloorId: string
  isLookupLoading: boolean
  isSubmitting: boolean
  canCheckIn: boolean
  onPlateChange: (value: string) => void
  onVehicleTypeChange: (value: GateVehicleType) => void
  onFloorChange: (value: string) => void
  onNoteChange: (value: string) => void
  onLookup: () => void
  onCheckIn: () => void
}

export function StaffGateCheckInForm({
  plate,
  vehicleType,
  note,
  lookupResult,
  lookupMatchesPlate,
  checkInCustomerType,
  floorOptions,
  selectedFloorId,
  isLookupLoading,
  isSubmitting,
  canCheckIn,
  onPlateChange,
  onVehicleTypeChange,
  onFloorChange,
  onNoteChange,
  onLookup,
  onCheckIn,
}: StaffGateCheckInFormProps) {
  const isVehicleTypeLocked =
    lookupMatchesPlate && Boolean(lookupResult?.subscription?.vehicleType || lookupResult?.booking)

  return (
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-theme bg-gradient-to-r from-emerald-500/15 via-transparent to-transparent p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/20">
            IN
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">Quy trình xe vào</p>
            <h2 className="mt-1 text-xl font-bold text-fg">Tiếp nhận phương tiện</h2>
            <p className="mt-1 text-sm text-muted">Tra cứu biển số, xác nhận thông tin và phân bổ vị trí đỗ.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-5 md:p-6">
        <StaffGateCameraScanner gate="entry" onUsePlate={onPlateChange} />

        <StaffGateField label="Biển số xe">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
            <input
              required
              value={plate}
              onChange={(event) => onPlateChange(event.target.value)}
              placeholder="VD: 59X2-481.22"
              className="auth-input h-14 rounded-xl border px-4 text-lg font-bold uppercase tracking-[0.08em] text-fg"
            />
            <button
              type="button"
              onClick={onLookup}
              disabled={isLookupLoading || normalizePlate(plate).length < 4}
              className="h-14 rounded-xl bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isLookupLoading ? 'Đang tra cứu...' : 'Tra cứu xe'}
            </button>
          </div>
        </StaffGateField>

        {lookupMatchesPlate && lookupResult && (
          <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 p-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-bold tracking-wide text-fg">{lookupResult.licensePlate}</p>
                <p className="mt-1 text-muted">
                  {lookupResult.booking ? 'Khách đặt trước' : formatCustomerType(lookupResult.customerType)}
                  {lookupResult.subscription?.owner?.fullName
                    ? ` / ${lookupResult.subscription.owner.fullName}`
                    : ''}
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
                {lookupResult.status === 'already_active' ? 'Đang gửi' : 'Sẵn sàng ghi nhận xe vào'}
              </span>
            </div>
          </div>
        )}

        {lookupMatchesPlate && lookupResult?.booking && (
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm">
            <p className="font-semibold text-fg">Đặt chỗ ô tô đã thanh toán</p>
            <p className="mt-1 text-xs text-muted">
              Đã trả trước {lookupResult.booking.durationHours} giờ. Nhân viên chọn tầng ô tô để ghi nhận xe vào.
            </p>
          </div>
        )}

        <StaffGateField label="Loại xe">
          <div className="grid gap-3 sm:grid-cols-2">
            {(['motorcycle', 'car'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onVehicleTypeChange(type)}
                disabled={isVehicleTypeLocked}
                className={[
                  'min-h-20 rounded-xl border px-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-70',
                  vehicleType === type
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg'
                    : 'border-theme bg-badge text-muted hover:-translate-y-0.5 hover:bg-ghost hover:text-fg',
                ].join(' ')}
              >
                <span className="block text-sm font-semibold">{formatVehicleType(type)}</span>
                <span className="mt-1 block text-xs opacity-75">
                  Hệ thống tự phân bổ tầng còn chỗ
                </span>
              </button>
            ))}
          </div>
        </StaffGateField>

        <StaffAssignedParking
          vehicleType={vehicleType}
          customerType={checkInCustomerType}
          floorOptions={floorOptions}
          selectedFloorId={selectedFloorId}
          onFloorChange={onFloorChange}
        />

        <StaffGateField label="Ghi chú">
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            rows={3}
            placeholder="VD: thẻ tạm, tình trạng xe, hướng dẫn đặc biệt..."
            className="auth-input resize-none rounded-xl border px-4 py-3 text-sm text-fg"
          />
        </StaffGateField>

        <button
          type="button"
          onClick={onCheckIn}
          disabled={!canCheckIn || isSubmitting}
          className="h-14 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận cho xe vào →'}
        </button>
      </div>
    </section>
  )
}

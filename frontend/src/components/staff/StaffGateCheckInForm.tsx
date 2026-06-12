import type {
  GateCustomerType,
  GateLookupResult,
  GateVehicleType,
} from '../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../utils/staffGateAllocation'
import { StaffAssignedParking } from './StaffAssignedParking'
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
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-2 border-b border-theme pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Xe vào</p>
        <h2 className="text-xl font-semibold text-fg">Ghi nhận xe vào</h2>
        <p className="text-sm text-muted">
          Nhân viên nhập biển số, tra cứu để hệ thống xác định cư dân hoặc khách vãng lai, rồi chọn vị trí phù hợp.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <StaffGateField label="Biển số xe">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <input
              required
              value={plate}
              onChange={(event) => onPlateChange(event.target.value)}
              placeholder="VD: 59X2-481.22"
              className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
            />
            <button
              type="button"
              onClick={onLookup}
              disabled={isLookupLoading || normalizePlate(plate).length < 4}
              className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLookupLoading ? 'Đang tra' : 'Tra cứu'}
            </button>
          </div>
        </StaffGateField>

        {lookupMatchesPlate && lookupResult && (
          <div className="rounded-lg border border-theme bg-badge p-4 text-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-fg">{lookupResult.licensePlate}</p>
                <p className="mt-1 text-subtle">
                  {lookupResult.booking ? 'Khách đặt trước' : formatCustomerType(lookupResult.customerType)}
                  {lookupResult.subscription?.owner?.fullName
                    ? ` / ${lookupResult.subscription.owner.fullName}`
                    : ''}
                </p>
              </div>
              <span className="w-fit rounded-full border border-theme px-3 py-1 text-[11px] text-subtle">
                {lookupResult.status === 'already_active' ? 'Đang gửi' : 'Sẵn sàng ghi nhận xe vào'}
              </span>
            </div>
          </div>
        )}

        {lookupMatchesPlate && lookupResult?.booking && (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
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
                  'min-h-16 rounded-lg border px-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70',
                  vehicleType === type
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg'
                    : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
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
            className="auth-input resize-none rounded-lg border px-3 py-3 text-sm text-fg"
          />
        </StaffGateField>

        <button
          type="button"
          onClick={onCheckIn}
          disabled={!canCheckIn || isSubmitting}
          className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Đang ghi nhận...' : 'Ghi nhận xe vào'}
        </button>
      </div>
    </section>
  )
}

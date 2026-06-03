import type { Floor } from '../../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateLookupResult,
  GateRow,
  GateSlot,
  GateVehicleType,
} from '../../services/staffGateApi'
import { StaffGateField } from './StaffGateField'
import {
  formatCustomerType,
  formatVehicleType,
  getBuildingName,
  getFloorId,
  normalizePlate,
} from './staffGateUtils'

type StaffGateCheckInFormProps = {
  plate: string
  vehicleType: GateVehicleType
  rowId: string
  slotId: string
  note: string
  lookupResult: GateLookupResult | null
  lookupMatchesPlate: boolean
  checkInCustomerType?: GateCustomerType
  rowOptions: GateRow[]
  slotOptions: GateSlot[]
  floorMap: Map<string, Floor>
  isLookupLoading: boolean
  isSubmitting: boolean
  canCheckIn: boolean
  onPlateChange: (value: string) => void
  onVehicleTypeChange: (value: GateVehicleType) => void
  onRowChange: (value: string) => void
  onSlotChange: (value: string) => void
  onNoteChange: (value: string) => void
  onLookup: () => void
  onCheckIn: () => void
}

export function StaffGateCheckInForm({
  plate,
  vehicleType,
  rowId,
  slotId,
  note,
  lookupResult,
  lookupMatchesPlate,
  checkInCustomerType,
  rowOptions,
  slotOptions,
  floorMap,
  isLookupLoading,
  isSubmitting,
  canCheckIn,
  onPlateChange,
  onVehicleTypeChange,
  onRowChange,
  onSlotChange,
  onNoteChange,
  onLookup,
  onCheckIn,
}: StaffGateCheckInFormProps) {
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
                  {formatCustomerType(lookupResult.customerType)}
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

        <StaffGateField label="Loại xe">
          <div className="grid gap-3 sm:grid-cols-2">
            {(['motorcycle', 'car'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onVehicleTypeChange(type)}
                disabled={Boolean(lookupResult?.subscription?.vehicleType)}
                className={[
                  'min-h-16 rounded-lg border px-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-70',
                  vehicleType === type
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg'
                    : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
                ].join(' ')}
              >
                <span className="block text-sm font-semibold">{formatVehicleType(type)}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {type === 'motorcycle' ? 'Chọn hàng đỗ xe máy' : 'Khách vãng lai chọn ô đỗ ô tô'}
                </span>
              </button>
            ))}
          </div>
        </StaffGateField>

        {vehicleType === 'motorcycle' ? (
          <StaffGateField label="Hàng xe máy">
            <select
              value={rowId}
              onChange={(event) => onRowChange(event.target.value)}
              className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
            >
              <option value="">Chọn hàng còn chỗ</option>
              {rowOptions.map((row) => {
                const floor = floorMap.get(getFloorId(row))
                const buildingName = getBuildingName(floor)
                return (
                  <option key={row._id} value={row._id}>
                    {buildingName ? `${buildingName} - ` : ''}
                    Tầng {floor?.floorNumber ?? '--'} - {row.rowCode} - còn{' '}
                    {Math.max(0, row.capacity - row.occupiedCount)}/{row.capacity}
                  </option>
                )
              })}
            </select>
          </StaffGateField>
        ) : checkInCustomerType === 'resident' ? (
          <div className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
            Cư dân ô tô sẽ dùng ô đỗ cố định trong gói cư dân, frontend không gửi slotId.
          </div>
        ) : (
          <StaffGateField label="Ô đỗ ô tô cho khách vãng lai">
            <select
              value={slotId}
              onChange={(event) => onSlotChange(event.target.value)}
              className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
            >
              <option value="">Chọn ô còn trống</option>
              {slotOptions.map((slot) => {
                const floor = floorMap.get(getFloorId(slot))
                const buildingName = getBuildingName(floor)
                return (
                  <option key={slot._id} value={slot._id}>
                    {buildingName ? `${buildingName} - ` : ''}
                    Tầng {floor?.floorNumber ?? '--'} - {slot.slotCode}
                  </option>
                )
              })}
            </select>
          </StaffGateField>
        )}

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

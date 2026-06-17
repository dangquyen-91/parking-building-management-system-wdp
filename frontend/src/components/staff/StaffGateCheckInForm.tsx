import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type {
  GateCustomerType,
  GateLookupResult,
  GateVehicleType,
} from '../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../utils/staffGateAllocation'
import { StaffAssignedParking } from './StaffAssignedParking'
import { StaffGateCameraScanner } from './StaffGateCameraScanner'
import { StaffGateField } from './StaffGateField'
import { StaffGateQrScanner } from './StaffGateQrScanner'
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
  entryQrValue: string
  issuedWalkInQrValue: string
  onPlateChange: (value: string) => void
  onVehicleTypeChange: (value: GateVehicleType) => void
  onFloorChange: (value: string) => void
  onNoteChange: (value: string) => void
  onLookup: () => void
  onIssueWalkInQr: () => void
  onEntryQrScanned: (qrValue: string) => void
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
  entryQrValue,
  issuedWalkInQrValue,
  onPlateChange,
  onVehicleTypeChange,
  onFloorChange,
  onNoteChange,
  onLookup,
  onIssueWalkInQr,
  onEntryQrScanned,
  onCheckIn,
}: StaffGateCheckInFormProps) {
  const [walkInQrDataUrl, setWalkInQrDataUrl] = useState('')
  const isVehicleTypeLocked =
    lookupMatchesPlate && Boolean(lookupResult?.subscription?.vehicleType || lookupResult?.booking)
  const isResident = lookupMatchesPlate && lookupResult?.customerType === 'resident'
  const isWalkIn = lookupMatchesPlate && lookupResult?.customerType === 'walk_in'

  useEffect(() => {
    let ignore = false

    if (!issuedWalkInQrValue) {
      setWalkInQrDataUrl('')
      return undefined
    }

    void QRCode.toDataURL(issuedWalkInQrValue, {
      width: 220,
      margin: 1,
      errorCorrectionLevel: 'M',
    }).then((url) => {
      if (!ignore) setWalkInQrDataUrl(url)
    })

    return () => {
      ignore = true
    }
  }, [issuedWalkInQrValue])

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
            <p className="mt-1 text-sm text-muted">Camera đọc biển số, QR khớp biển số, sau đó mới ghi nhận xe vào.</p>
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
                  {lookupResult.subscription?.owner?.fullName ? ` / ${lookupResult.subscription.owner.fullName}` : ''}
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
                {lookupResult.status === 'already_active' ? 'Đang gửi' : 'Sẵn sàng xác minh QR'}
              </span>
            </div>
          </div>
        )}

        {lookupMatchesPlate && lookupResult?.booking && (
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm">
            <p className="font-semibold text-fg">Đặt chỗ ô tô đã thanh toán</p>
            <p className="mt-1 text-xs text-muted">
              Đã trả trước {lookupResult.booking.durationHours} giờ. Vé QR cổng vào vẫn được xác minh để đối chiếu khi xe ra.
            </p>
          </div>
        )}

        {lookupMatchesPlate && lookupResult && (
          <div className="grid gap-4 rounded-2xl border border-theme bg-badge p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Xác minh QR cổng vào</p>
                <h3 className="mt-1 text-base font-bold text-fg">
                  {isResident ? 'Quét QR gói cư dân' : 'Cấp vé QR vãng lai rồi quét lại'}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  QR phải khớp biển số camera {lookupResult.licensePlate}. Sau khi xác minh mới cho xe vào.
                </p>
              </div>
              <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold text-white ${entryQrValue ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                {entryQrValue ? 'QR ĐÃ KHỚP' : 'CHỜ QR'}
              </span>
            </div>

            {isWalkIn && (
              <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                <div className="flex min-h-44 items-center justify-center rounded-xl border border-theme bg-white p-3">
                  {walkInQrDataUrl ? (
                    <img src={walkInQrDataUrl} alt={`Vé QR ${lookupResult.licensePlate}`} className="size-full object-contain" />
                  ) : (
                    <p className="text-center text-xs text-zinc-500">Bấm cấp vé để tạo QR vãng lai.</p>
                  )}
                </div>
                <div className="grid content-start gap-3">
                  <button
                    type="button"
                    onClick={onIssueWalkInQr}
                    className="h-11 rounded-xl bg-sky-600 px-4 text-xs font-bold text-white hover:bg-sky-500"
                  >
                    {issuedWalkInQrValue ? 'Cấp lại vé QR' : 'Cấp vé QR vãng lai'}
                  </button>
                  <p className="text-xs text-muted">
                    Vé QR này chỉ dùng cho biển số đang đọc và phải quét lại trong 5 phút để xác nhận xe vào.
                  </p>
                </div>
              </div>
            )}

            <StaffGateQrScanner
              title={isResident ? 'QR gói cư dân' : 'Quét lại vé QR vừa cấp'}
              description={isResident ? 'Cư dân đưa QR gói đã mua để đối chiếu với biển số camera.' : 'Quét đúng vé QR vừa cấp để xác nhận check-in.'}
              verified={Boolean(entryQrValue)}
              disabled={isWalkIn && !issuedWalkInQrValue}
              onScan={onEntryQrScanned}
            />
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
                  {type === 'car' ? 'Vãng lai theo tầng, cư dân giữ ô riêng' : 'Tự chọn hàng còn chỗ'}
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
          {isSubmitting ? 'Đang ghi nhận...' : entryQrValue ? 'Xác nhận cho xe vào →' : 'Cần xác minh QR trước'}
        </button>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type {
  GateCustomerType,
  GateLookupResult,
  GateVehicleType,
} from '../../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../../utils/staffGateAllocation'
import { StaffGateField } from '../common/StaffGateField'
import { StaffAssignedParking } from '../parking/StaffAssignedParking'
import { StaffGateCameraScanner } from '../scanner/StaffGateCameraScanner'
import {
  CheckInStepHeader,
  CheckInWizardActions,
  StepIntro,
  type CheckInStep,
} from './StaffGateCheckInSteps'
import { StaffGateQrScanner } from '../scanner/StaffGateQrScanner'
import {
  formatCustomerType,
  formatVehicleType,
  normalizePlate,
} from '../data/staffGateUtils'

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
  entryQrError?: string
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
  entryQrError,
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
  const previousLookupMatchesRef = useRef(false)
  const previousEntryQrValueRef = useRef('')
  const [step, setStep] = useState<CheckInStep>(1)
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

  useEffect(() => {
    const justMatched = lookupMatchesPlate && !previousLookupMatchesRef.current
    previousLookupMatchesRef.current = lookupMatchesPlate

    if (!lookupMatchesPlate) {
      setStep(1)
      return
    }

    if (justMatched) setStep(2)
  }, [lookupMatchesPlate])

  useEffect(() => {
    const justVerifiedQr = Boolean(entryQrValue) && entryQrValue !== previousEntryQrValueRef.current
    previousEntryQrValueRef.current = entryQrValue

    if (justVerifiedQr && step === 3) setStep(4)
  }, [entryQrValue, step])

  function canOpenStep(targetStep: CheckInStep) {
    if (targetStep === 1) return true
    if (targetStep === 2) return lookupMatchesPlate && Boolean(lookupResult)
    if (targetStep === 3) return lookupMatchesPlate && Boolean(lookupResult)
    if (targetStep === 4) return isWalkIn ? Boolean(issuedWalkInQrValue) : Boolean(entryQrValue)
    return false
  }

  function goNext() {
    if (step < 4) setStep((step + 1) as CheckInStep)
  }

  function goPrevious() {
    if (step > 1) setStep((step - 1) as CheckInStep)
  }

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
            <p className="mt-1 text-sm text-muted">Làm theo từng bước để camera, QR và vị trí không bị lẫn thao tác.</p>
          </div>
        </div>
      </div>

      <CheckInStepHeader step={step} canOpenStep={canOpenStep} onStepChange={setStep} />

      <div className="grid gap-6 p-5 md:p-6">
        {step === 1 && (
          <>
            <StepIntro title="Bước 1: Quét hoặc nhập biển số" description="Camera chỉ nhập nhanh biển số vào ô tra cứu. Staff vẫn có thể sửa tay trước khi tra cứu." />
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
          </>
        )}

        {step === 2 && lookupMatchesPlate && lookupResult && (
          <>
            <StepIntro title="Bước 2: Kiểm tra thông tin xe" description="Đối chiếu loại khách, chủ xe, gói cư dân hoặc booking trước khi xác minh QR." />

            <div className="rounded-2xl border border-emerald-500/35 bg-emerald-500/10 p-5 text-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-subtle">Biển số xe</p>
                  <p className="mt-1 text-2xl font-black tracking-[0.08em] text-fg">{lookupResult.licensePlate}</p>
                  <p className="mt-2 text-muted">
                    {lookupResult.booking ? 'Khách đặt trước' : formatCustomerType(lookupResult.customerType)}
                    {lookupResult.subscription?.owner?.fullName ? ` / ${lookupResult.subscription.owner.fullName}` : ''}
                  </p>
                </div>
                <span className="w-fit rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
                  {lookupResult.status === 'already_active' ? 'Đang gửi' : 'Sẵn sàng xác minh QR'}
                </span>
              </div>
            </div>

            {lookupResult.booking && (
              <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm">
                <p className="font-semibold text-fg">Đặt chỗ ô tô đã thanh toán</p>
                <p className="mt-1 text-xs text-muted">
                  Đã trả trước {lookupResult.booking.durationHours} giờ. Vé QR cổng vào vẫn được xác minh để đối chiếu khi xe ra.
                </p>
              </div>
            )}
          </>
        )}

        {step === 3 && lookupMatchesPlate && lookupResult && (
          <>
            <StepIntro
              title="Bước 3: Xác minh QR"
              description={isResident ? 'Cư dân đưa QR gói đã mua để đối chiếu với biển số camera.' : 'Khách vãng lai chỉ cần cấp vé QR, không cần quét lại ngay lúc xe vào.'}
            />

            <div className="grid gap-4 rounded-2xl border border-theme bg-badge p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Xác minh QR cổng vào</p>
                  <h3 className="mt-1 text-base font-bold text-fg">
                    {isResident ? 'Quét QR gói cư dân' : 'Cấp vé QR vãng lai'}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {isResident
                      ? `QR phải khớp biển số camera ${lookupResult.licensePlate}. Sau khi xác minh mới cho xe vào.`
                      : `Vé QR được gắn với biển số ${lookupResult.licensePlate} và dùng để đối chiếu khi xe ra.`}
                  </p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1 text-[10px] font-bold text-white ${(isWalkIn ? issuedWalkInQrValue : entryQrValue) ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                  {isWalkIn
                    ? issuedWalkInQrValue
                      ? 'ĐÃ CẤP VÉ'
                      : 'CHƯA CẤP VÉ'
                    : entryQrValue
                      ? 'QR ĐÃ KHỚP'
                      : 'CHỜ QR'}
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
                      Vé QR này chỉ dùng cho biển số đang đọc. Sau khi xác nhận xe vào, đưa vé này cho khách giữ để quét khi xe ra.
                    </p>
                  </div>
                </div>
              )}

              {isResident && (
                <StaffGateQrScanner
                  title="QR gói cư dân"
                  description="Cư dân đưa QR gói đã mua để đối chiếu với biển số camera."
                  verified={Boolean(entryQrValue)}
                  onScan={onEntryQrScanned}
                />
              )}
              {entryQrError && (
                <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200">
                  {entryQrError}
                </p>
              )}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <StepIntro title="Bước 4: Chọn loại xe và vị trí" description="Hệ thống tự chọn hàng còn chỗ hoặc giữ vị trí theo gói cư dân." />

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
          </>
        )}

        <CheckInWizardActions
          step={step}
          canNext={
            (step === 1 && lookupMatchesPlate && Boolean(lookupResult))
            || (step === 2 && lookupMatchesPlate && Boolean(lookupResult))
            || (step === 3 && (isWalkIn ? Boolean(issuedWalkInQrValue) : Boolean(entryQrValue)))
          }
          canCheckIn={canCheckIn}
          isSubmitting={isSubmitting}
          onPrevious={step > 1 ? goPrevious : undefined}
          onNext={step < 4 ? goNext : undefined}
          onCheckIn={onCheckIn}
        />
      </div>
    </section>
  )
}

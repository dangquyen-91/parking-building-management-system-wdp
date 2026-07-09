import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import type {
  GateCustomerType,
  GateLookupResult,
  GateVehicleType,
} from '../../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../../utils/staffGateAllocation'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { StaffGateField } from '../common/StaffGateField'
import { StaffAssignedParking } from '../parking/StaffAssignedParking'
import { StaffGateCameraScanner } from '../scanner/StaffGateCameraScanner'
import { StaffGateQrScanner } from '../scanner/StaffGateQrScanner'
import {
  formatCustomerType,
  formatVehicleType,
  normalizePlate,
} from '../data/staffGateUtils'
import {
  CheckInStepHeader,
  CheckInWizardActions,
  StepIntro,
  type CheckInStep,
} from './StaffGateCheckInSteps'

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
      const timeoutId = window.setTimeout(() => setStep(1), 0)
      return () => window.clearTimeout(timeoutId)
    }

    if (justMatched) {
      const timeoutId = window.setTimeout(() => setStep(2), 0)
      return () => window.clearTimeout(timeoutId)
    }

    return undefined
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
    <Card className="overflow-hidden border-sky-500/20 bg-gradient-to-br from-background via-background to-sky-500/5">
      <CardHeader>
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-lg font-bold text-white shadow-lg shadow-sky-500/20">
            IN
          </span>
          <div>
            <CardDescription>Quy trình xe vào</CardDescription>
            <CardTitle>Tiếp nhận phương tiện</CardTitle>
            <CardDescription>
              Làm theo từng bước để camera, QR và vị trí không bị lẫn thao tác.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CheckInStepHeader step={step} canOpenStep={canOpenStep} onStepChange={setStep} />

      <CardContent className="grid gap-6 p-5 md:p-6">
        {step === 1 && (
          <>
            <StepIntro
              title="Bước 1: Quét hoặc nhập biển số"
              description="Camera chỉ nhập nhanh biển số vào ô tra cứu. Staff vẫn có thể sửa tay trước khi tra cứu."
            />
            <StaffGateCameraScanner gate="entry" onUsePlate={onPlateChange} />

            <StaffGateField label="Biển số xe">
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <Input
                  required
                  value={plate}
                  onChange={(event) => onPlateChange(event.target.value)}
                  placeholder="VD: 59X2-481.22"
                  className="h-14 text-lg font-bold uppercase tracking-[0.08em]"
                />
                <Button
                  type="button"
                  onClick={onLookup}
                  disabled={isLookupLoading || normalizePlate(plate).length < 4}
                  className="h-14"
                >
                  {isLookupLoading ? 'Đang tra cứu...' : 'Tra cứu xe'}
                </Button>
              </div>
            </StaffGateField>
          </>
        )}

        {step === 2 && lookupMatchesPlate && lookupResult && (
          <>
            <StepIntro
              title="Bước 2: Kiểm tra thông tin xe"
              description="Đối chiếu loại khách, chủ xe, gói cư dân hoặc booking trước khi xác minh QR."
            />

            <Card size="sm">
              <CardContent className="p-5 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Biển số xe</p>
                    <p className="mt-1 text-2xl font-bold tracking-[0.08em]">{lookupResult.licensePlate}</p>
                    <p className="mt-2 text-muted-foreground">
                      {lookupResult.booking ? 'Khách đặt trước' : formatCustomerType(lookupResult.customerType)}
                      {lookupResult.subscription?.owner?.fullName ? ` / ${lookupResult.subscription.owner.fullName}` : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {lookupResult.status === 'already_active' ? 'Đang gửi' : 'Sẵn sàng xác minh QR'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {lookupResult.booking && (
              <Card size="sm">
                <CardHeader>
                  <CardTitle>Đặt chỗ ô tô đã thanh toán</CardTitle>
                  <CardDescription>
                    Đã trả trước {lookupResult.booking.durationHours} giờ. Vé QR cổng vào vẫn được xác minh để đối chiếu khi xe ra.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </>
        )}

        {step === 3 && lookupMatchesPlate && lookupResult && (
          <>
            <StepIntro
              title="Bước 3: Xác minh QR"
              description={isResident ? 'Cư dân đưa QR gói đã mua để đối chiếu với biển số camera.' : 'Khách vãng lai chỉ cần cấp vé QR, không cần quét lại ngay lúc xe vào.'}
            />

            <Card size="sm">
              <CardContent className="grid gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Xác minh QR cổng vào</p>
                    <h3 className="mt-1 text-base font-bold">
                      {isResident ? 'Quét QR gói cư dân' : 'Cấp vé QR vãng lai'}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {isResident
                        ? `QR phải khớp biển số camera ${lookupResult.licensePlate}. Sau khi xác minh mới cho xe vào.`
                        : `Vé QR được gắn với biển số ${lookupResult.licensePlate} và dùng để đối chiếu khi xe ra.`}
                    </p>
                  </div>
                  <Badge variant={(isWalkIn ? issuedWalkInQrValue : entryQrValue) ? 'default' : 'secondary'}>
                    {isWalkIn
                      ? issuedWalkInQrValue
                        ? 'Đã cấp vé'
                        : 'Chưa cấp vé'
                      : entryQrValue
                        ? 'QR đã khớp'
                        : 'Chờ QR'}
                  </Badge>
                </div>

                {isWalkIn && (
                  <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                    <div className="flex min-h-44 items-center justify-center rounded-lg border bg-white p-3">
                      {issuedWalkInQrValue && walkInQrDataUrl ? (
                        <img src={walkInQrDataUrl} alt={`Vé QR ${lookupResult.licensePlate}`} className="size-full object-contain" />
                      ) : (
                        <p className="text-center text-xs text-zinc-500">Bấm cấp vé để tạo QR vãng lai.</p>
                      )}
                    </div>
                    <div className="grid content-start gap-3">
                      <Button type="button" onClick={onIssueWalkInQr}>
                        {issuedWalkInQrValue ? 'Cấp lại vé QR' : 'Cấp vé QR vãng lai'}
                      </Button>
                      <p className="text-xs text-muted-foreground">
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
                  <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {entryQrError}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {step === 4 && (
          <>
            <StepIntro
              title="Bước 4: Chọn loại xe và vị trí"
              description="Hệ thống tự chọn hàng còn chỗ hoặc giữ vị trí theo gói cư dân."
            />

            <StaffGateField label="Loại xe">
              <div className="grid gap-3 sm:grid-cols-2">
                {(['motorcycle', 'car'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={vehicleType === type ? 'default' : 'outline'}
                    onClick={() => onVehicleTypeChange(type)}
                    disabled={isVehicleTypeLocked}
                    className="h-auto min-h-20 justify-start px-4 text-left"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{formatVehicleType(type)}</span>
                      <span className="mt-1 block text-xs opacity-75">
                        {type === 'car' ? 'Vãng lai theo tầng, cư dân giữ ô riêng' : 'Tự chọn hàng còn chỗ'}
                      </span>
                    </span>
                  </Button>
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
              <Textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={3}
                placeholder="VD: thẻ tạm, tình trạng xe, hướng dẫn đặc biệt..."
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
      </CardContent>
    </Card>
  )
}

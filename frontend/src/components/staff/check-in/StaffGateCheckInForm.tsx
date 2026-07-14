import { useEffect, useRef, useState } from 'react'
import { Bike, CarFront, LogIn, ShieldCheck, Ticket } from 'lucide-react'
import QRCode from 'qrcode'
import type {
  GateLookupResult,
  GateVehicleType,
} from '../../../services/staffGateApi'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { StaffGateField } from '../common/StaffGateField'
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
  isLookupLoading: boolean
  isSubmitting: boolean
  canCheckIn: boolean
  entryQrValue: string
  entryQrError?: string
  issuedWalkInQrValue: string
  onPlateChange: (value: string) => void
  onVehicleTypeChange: (value: GateVehicleType) => void
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
  isLookupLoading,
  isSubmitting,
  canCheckIn,
  entryQrValue,
  entryQrError,
  issuedWalkInQrValue,
  onPlateChange,
  onVehicleTypeChange,
  onNoteChange,
  onLookup,
  onIssueWalkInQr,
  onEntryQrScanned,
  onCheckIn,
}: StaffGateCheckInFormProps) {
  const previousLookupMatchesRef = useRef(false)
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

  function canOpenStep(targetStep: CheckInStep) {
    if (targetStep === 1) return true
    if (targetStep === 2) return lookupMatchesPlate && Boolean(lookupResult)
    if (targetStep === 3) return lookupMatchesPlate && Boolean(lookupResult)
    return false
  }

  function goNext() {
    if (step < 3) setStep((step + 1) as CheckInStep)
  }

  function goPrevious() {
    if (step > 1) setStep((step - 1) as CheckInStep)
  }

  return (
    <Card className="overflow-hidden rounded-2xl border-sky-500/20 bg-background shadow-xl shadow-slate-950/5">
      <CardHeader className="border-b border-white/15 bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-500 p-5 text-white md:p-6">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/25">
            <LogIn className="size-6" />
          </span>
          <div>
            <CardDescription className="font-semibold uppercase tracking-[0.16em] text-white/70">Quy trình xe vào</CardDescription>
            <CardTitle className="mt-1 text-xl font-bold text-white">Tiếp nhận phương tiện</CardTitle>
            <CardDescription className="mt-1 text-white/75">
              Làm theo từng bước để camera, thông tin xe và QR không bị lẫn thao tác.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CheckInStepHeader step={step} canOpenStep={canOpenStep} onStepChange={setStep} />

      <CardContent className="grid gap-6 bg-gradient-to-b from-sky-500/[0.025] to-transparent p-5 md:p-6">
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

            <Card size="sm" className="border-sky-500/20 bg-sky-500/5 shadow-sm">
              <CardContent className="p-5 text-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Biển số xe</p>
                    <p className="mt-1 text-3xl font-black tracking-[0.1em]">{lookupResult.licensePlate}</p>
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

            <StaffGateField label="Loại xe">
              <div className="grid gap-3 sm:grid-cols-2">
                {(['motorcycle', 'car'] as const).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={vehicleType === type ? 'default' : 'outline'}
                    onClick={() => onVehicleTypeChange(type)}
                    disabled={isVehicleTypeLocked}
                    className="h-auto min-h-24 justify-start rounded-xl px-4 text-left shadow-sm"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-background/80 shadow-sm">
                        {type === 'car' ? <CarFront className="size-5" /> : <Bike className="size-5" />}
                      </span>
                      <span className="block text-sm font-semibold">{formatVehicleType(type)}</span>
                    </span>
                  </Button>
                ))}
              </div>
            </StaffGateField>

            <StaffGateField label="Ghi chú (không bắt buộc)">
              <Textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={3}
                placeholder="VD: thẻ tạm, tình trạng xe, hướng dẫn đặc biệt..."
              />
            </StaffGateField>
          </>
        )}

        {step === 3 && lookupMatchesPlate && lookupResult && (
          <>
            <StepIntro
              title="Bước 3: Xác minh QR"
              description={isResident ? 'Cư dân đưa QR gói đã mua để đối chiếu với biển số camera.' : 'Khách vãng lai chỉ cần cấp vé QR, không cần quét lại ngay lúc xe vào.'}
            />

            <Card size="sm" className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent shadow-sm">
              <CardContent className="grid gap-4 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Xác minh QR cổng vào</p>
                    <h3 className="mt-1 text-base font-bold">
                      <span className="inline-flex items-center gap-2">
                        {isResident ? <ShieldCheck className="size-4 text-emerald-600" /> : <Ticket className="size-4 text-sky-600" />}
                        {isResident ? 'Quét QR gói cư dân' : 'Cấp vé QR vãng lai'}
                      </span>
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
          onNext={step < 3 ? goNext : undefined}
          onCheckIn={onCheckIn}
        />
      </CardContent>
    </Card>
  )
}

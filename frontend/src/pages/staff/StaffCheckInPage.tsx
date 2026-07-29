import {
  StaffGateCheckInForm,
  StaffGateCheckInTicket,
  StaffGateSessionActivity,
  StaffGateSummary,
  StaffGateToast,
  StaffPageHeader,
} from '../../components/staff'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Skeleton } from '../../components/ui/skeleton'
import { useStaffGateController } from '../../hooks/useStaffGateController'
import { LogIn } from 'lucide-react'

export function StaffCheckInPage() {
  const gate = useStaffGateController()

  return (
    <div className="mx-auto max-w-375 p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Cổng đang hoạt động"
        title="Tiếp nhận xe vào"
        description="Thực hiện theo từng bước: camera, kiểm tra thông tin, xác minh QR và cho xe vào bãi. Vị trí được hệ thống tự phân bổ."
        icon={<LogIn className="size-7" />}
        tone="sky"
        actions={
          <StaffGateSummary
            activeCount={gate.activeSessions.length}
            completedCount={gate.completedSessions.length}
            availableCount={Math.max(0, gate.availableCount)}
          />
        }
      />

      {gate.actionMessage && (
        <Alert className="mb-5">
          <AlertDescription>{gate.actionMessage}</AlertDescription>
        </Alert>
      )}

      {gate.error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{gate.error}</AlertDescription>
        </Alert>
      )}

      {gate.isLoading ? (
        <Skeleton className="h-80 rounded-xl" />
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <StaffGateCheckInForm
            plate={gate.plate}
            vehicleType={gate.vehicleType}
            note={gate.note}
            lookupResult={gate.lookupResult}
            lookupMatchesPlate={gate.lookupMatchesPlate}
            isLookupLoading={gate.isLookupLoading}
            isSubmitting={gate.isSubmitting}
            canCheckIn={gate.canCheckIn}
            entryQrValue={gate.entryQrValue}
            entryQrError={gate.entryQrError}
            issuedWalkInQrValue={gate.issuedWalkInQrValue}
            onPlateChange={gate.handlePlateChange}
            onVehicleTypeChange={gate.handleVehicleTypeChange}
            onNoteChange={gate.setNote}
            onLookup={gate.handleLookup}
            onIssueWalkInQr={gate.handleIssueWalkInQr}
            onEntryQrScanned={gate.handleEntryQrScanned}
            onCheckIn={gate.handleCheckIn}
          />

          <aside className="xl:sticky xl:top-6">
            <StaffGateSessionActivity sessions={[...gate.activeSessions, ...gate.completedSessions]} />
          </aside>
        </div>
      )}

      {gate.issuedTicket && (
        <StaffGateCheckInTicket
          session={gate.issuedTicket.session}
          qrValue={gate.issuedTicket.qrValue}
          onClose={() => gate.setIssuedTicket(null)}
        />
      )}

      {gate.toastMessage && <StaffGateToast message={gate.toastMessage} onClose={() => gate.setToastMessage(null)} />}
    </div>
  )
}

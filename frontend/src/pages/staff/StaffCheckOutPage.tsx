import {
  StaffGateCheckoutPanel,
  StaffGateSessionActivity,
  StaffGateSummary,
  StaffGateToast,
  StaffPageHeader,
} from '../../components/staff'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Skeleton } from '../../components/ui/skeleton'
import { useStaffGateController } from '../../hooks/useStaffGateController'

export function StaffCheckOutPage() {
  const gate = useStaffGateController()

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Cổng đang hoạt động"
        title="Thanh toán xe ra"
        description="Tìm xe đang gửi, xác minh QR, tính phí và hoàn tất xe rời bãi."
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
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <StaffGateCheckoutPanel
            query={gate.checkoutQuery}
            session={gate.selectedCheckoutSession}
            preview={gate.checkoutPreview}
            isPreviewLoading={gate.isPreviewLoading}
            isSubmitting={gate.isSubmitting}
            floorMap={gate.floorMap}
            onQueryChange={gate.setCheckoutQuery}
            onCheckoutCash={gate.handleCheckoutCash}
            onCheckoutTransfer={gate.handleCheckoutTransfer}
            onQrError={gate.setToastMessage}
            onQrSuccess={gate.setToastMessage}
          />

          <aside className="xl:sticky xl:top-6">
            <StaffGateSessionActivity sessions={[...gate.activeSessions, ...gate.completedSessions]} />
          </aside>
        </div>
      )}

      {gate.toastMessage && <StaffGateToast message={gate.toastMessage} onClose={() => gate.setToastMessage(null)} />}
    </div>
  )
}

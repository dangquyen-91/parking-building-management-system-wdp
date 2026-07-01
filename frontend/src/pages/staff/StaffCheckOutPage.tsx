import {
  StaffGateCheckoutPanel,
  StaffGateSessionActivity,
  StaffGateSummary,
  StaffGateToast,
  StaffPageHeader,
} from '../../components/staff'
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
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-fg">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">i</span>
          {gate.actionMessage}
        </div>
      )}

      {gate.error && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          {gate.error}
        </div>
      )}

      {gate.isLoading ? (
        <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải dữ liệu cổng...</div>
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
            onCheckoutLostTicket={gate.handleCheckoutLostTicket}
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

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { Booking } from '../../../services/bookingApi'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { formatBookingCurrency } from '../bookingUtils'

type BookingCancelDialogProps = {
  booking: Booking | null
  isCancelling: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function BookingCancelDialog({
  booking,
  isCancelling,
  error,
  onClose,
  onConfirm,
}: BookingCancelDialogProps) {
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    setAccepted(false)
  }, [booking])

  return (
    <Dialog
      open={booking !== null}
      onOpenChange={(open) => {
        if (!open && !isCancelling) onClose()
      }}
    >
      <DialogContent
        className="overflow-hidden border-rose-500/20 p-0 sm:max-w-lg"
        showCloseButton={!isCancelling}
      >
        {booking && (
          <>
            <DialogHeader className="border-b border-border bg-linear-to-r from-rose-500/15 via-amber-500/8 to-transparent p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-300">
                <AlertTriangle className="size-6" aria-hidden="true" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
                Cảnh báo hủy đặt chỗ
              </p>
              <DialogTitle className="text-2xl font-black leading-tight">
                Hủy booking {booking.licensePlate}?
              </DialogTitle>
              <DialogDescription className="leading-6">
                Booking sẽ bị hủy và không thể khôi phục. Khoản tiền đã thanh
                toán, nếu có, sẽ không được hoàn lại.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 p-6">
              <div className="rounded-2xl border border-rose-500/20 bg-rose-500/8 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Số tiền booking
                  </span>
                  <strong className="text-lg text-rose-700 dark:text-rose-200">
                    {formatBookingCurrency(booking.amount)}
                  </strong>
                </div>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Hãy kiểm tra kỹ trước khi tiếp tục thao tác hủy.
                </p>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 transition hover:border-rose-500/30">
                <input
                  type="checkbox"
                  checked={accepted}
                  disabled={isCancelling}
                  onChange={(event) => setAccepted(event.target.checked)}
                  className="mt-0.5 size-5 shrink-0 accent-rose-600"
                />
                <span className="text-sm leading-6 text-foreground">
                  Tôi đã đọc, hiểu booking sẽ bị hủy và đồng ý với điều khoản
                  không hoàn lại khoản tiền đã thanh toán.
                </span>
              </label>

              {error && (
                <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="m-0">
              <Button
                type="button"
                variant="outline"
                disabled={isCancelling}
                onClick={onClose}
              >
                Giữ booking
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!accepted || isCancelling}
                onClick={onConfirm}
              >
                {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

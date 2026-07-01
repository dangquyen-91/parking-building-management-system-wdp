import { useState } from 'react'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffCurrency } from '../data/staffGateData'

type LostTicketMethod = 'cash' | 'transfer'

type StaffGateLostTicketPanelProps = {
  session?: GateSession
  isSubmitting: boolean
  onCheckoutLostTicket: (session: GateSession, method: LostTicketMethod, note?: string) => void
}

const LOST_TICKET_FINE = 100000

export function StaffGateLostTicketPanel({
  session,
  isSubmitting,
  onCheckoutLostTicket,
}: StaffGateLostTicketPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [method, setMethod] = useState<LostTicketMethod>('cash')
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (!session || session.customerType === 'resident') return null

  function handleSubmit() {
    if (!session || !confirmed) return
    onCheckoutLostTicket(session, method, note.trim() || undefined)
  }

  return (
    <section className="rounded-xl border border-rose-400/30 bg-rose-500/10">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-600 dark:text-rose-300">
            Ngoại lệ
          </p>
          <h3 className="mt-1 text-sm font-bold text-fg">Khách mất vé / mất QR</h3>
          <p className="mt-1 text-xs text-muted">
            Dùng khi khách vãng lai không còn vé QR. Cần đối chiếu giấy tờ xe trước khi xử lý.
          </p>
        </div>
        <span className="rounded-full border border-rose-400/40 bg-page px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-200">
          {expanded ? 'Ẩn' : 'Xử lý'}
        </span>
      </button>

      {expanded && (
        <div className="grid gap-4 border-t border-rose-400/20 p-4">
          <div className="grid gap-3 rounded-xl border border-theme bg-page p-4 sm:grid-cols-3">
            <Info label="Biển số" value={session.licensePlate} />
            <Info label="Phí phạt mất vé" value={formatStaffCurrency(LOST_TICKET_FINE)} />
            <Info label="Loại khách" value="Khách vãng lai" />
          </div>

          <label className="grid gap-2 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Ghi chú xử lý
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="VD: Khách báo mất vé, đã đối chiếu giấy tờ xe và biển số."
              className="auth-input min-h-24 rounded-xl border px-4 py-3 text-sm text-fg"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <MethodButton
              active={method === 'cash'}
              label="Thu tiền mặt"
              detail="Đóng phiên ngay sau khi xác nhận."
              onClick={() => setMethod('cash')}
            />
            <MethodButton
              active={method === 'transfer'}
              label="Chuyển khoản"
              detail="Tạo QR PayOS gồm tiền gửi xe và phạt."
              onClick={() => setMethod('transfer')}
            />
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-100">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>
              Tôi đã đối chiếu giấy tờ xe, biển số camera và xác nhận đúng chủ xe trước khi xử lý mất vé.
            </span>
          </label>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !confirmed}
            className="h-12 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Đang xử lý...'
              : method === 'cash'
                ? 'Xác nhận mất vé và thu tiền mặt'
                : 'Tạo QR thanh toán mất vé'}
          </button>
        </div>
      )}
    </section>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 text-sm font-bold text-fg">{value}</p>
    </div>
  )
}

function MethodButton({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean
  label: string
  detail: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-xl border p-4 text-left transition-all',
        active
          ? 'border-rose-500 bg-rose-500/10 shadow-lg shadow-rose-500/10'
          : 'border-theme bg-page hover:border-rose-400/40',
      ].join(' ')}
    >
      <p className="text-sm font-bold text-fg">{label}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </button>
  )
}

export type { LostTicketMethod }

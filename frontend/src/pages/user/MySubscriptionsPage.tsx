import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResidentSubscriptionTopNav, SubscriptionCredentialQr } from '../../components/subscription'
import { complaintsApi } from '../../services/complaintsApi'
import { userSubscriptionApi, type Subscription } from '../../services/userSubscriptionApi'
import {
  formatSubscriptionDate,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_TONE,
  VEHICLE_LABELS,
} from '../../utils/subscriptionUi'

export function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [complaintTarget, setComplaintTarget] = useState<Subscription | null>(null)
  const [complaintPlate, setComplaintPlate] = useState('')
  const [complaintDescription, setComplaintDescription] = useState('')
  const [isComplaintSubmitting, setIsComplaintSubmitting] = useState(false)

  const stats = useMemo(() => {
    return {
      active: subscriptions.filter((item) => item.status === 'active').length,
      pending: subscriptions.filter((item) => item.status === 'pending').length,
      total: subscriptions.length,
    }
  }, [subscriptions])

  const loadSubscriptions = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await userSubscriptionApi.getMySubscriptions()
      setSubscriptions(response.subscriptions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách gói cư dân.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSubscriptions(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadSubscriptions])

  async function handleCancel(subscription: Subscription) {
    if (!window.confirm(`Hủy đơn chờ thanh toán của biển số ${subscription.licensePlate}?`)) return

    setError(null)
    setMessage(null)

    try {
      const result = await userSubscriptionApi.cancelSubscription(subscription._id)
      setSubscriptions((current) => current.map((item) => (item._id === result.subscription._id ? result.subscription : item)))
      setMessage('Đã hủy đơn chờ thanh toán.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy đơn.')
    }
  }

  async function handleSubmitComplaint() {
    if (!complaintTarget?.slotId?._id || !complaintPlate.trim()) return

    setError(null)
    setMessage(null)
    setIsComplaintSubmitting(true)

    try {
      const result = await complaintsApi.create({
        slotId: complaintTarget.slotId._id,
        offendingPlate: complaintPlate,
        description: complaintDescription.trim() || undefined,
      })
      setMessage(result.note ?? 'Đã gửi khiếu nại xe đậu sai chỗ. Nhân viên sẽ kiểm tra và xử lý.')
      setComplaintTarget(null)
      setComplaintPlate('')
      setComplaintDescription('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được khiếu nại đậu sai chỗ.')
    } finally {
      setIsComplaintSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <ResidentSubscriptionTopNav activeItem="my-subscriptions" />

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-8 pt-24 md:px-8 md:pb-10 lg:px-10">
        <div className="mb-6 overflow-hidden rounded-2xl border border-theme bg-badge">
          <div className="bg-gradient-to-r from-emerald-500/15 via-transparent to-sky-500/10 p-5 md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-subtle">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
                Tài khoản cư dân
              </div>
              <h1 className="text-3xl font-black tracking-tight text-fg md:text-4xl">Gói gửi xe của tôi</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Theo dõi thời hạn, vị trí đỗ và trạng thái đăng ký của từng phương tiện.
              </p>
            </div>
            <Link
              to="/#resident-plans"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-btn-primary px-6 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Mua gói mới →
            </Link>
          </div>
          </div>

          <div className="grid gap-px border-t border-theme bg-[color:var(--border)] sm:grid-cols-3">
            <StatBox label="Đang hiệu lực" value={stats.active} tone="emerald" />
            <StatBox label="Chờ thanh toán" value={stats.pending} tone="amber" />
            <StatBox label="Tổng gói đã đăng ký" value={stats.total} tone="sky" />
          </div>
        </div>

        {message && <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-fg">{message}</div>}
        {error && (
          <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-xl border border-theme bg-badge p-6 text-center text-sm text-muted">Đang tải danh sách gói...</div>
        ) : subscriptions.length === 0 ? (
          <section className="liquid-glass-card rounded-2xl p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-ghost text-2xl text-muted">+</span>
            <h2 className="mt-4 text-xl font-bold text-fg">Chưa có gói gửi xe</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Bạn có thể mua gói cư dân để biển số được nhận diện tại cổng.
            </p>
            <Link
              to="/#resident-plans"
              className="mt-5 inline-flex h-12 items-center justify-center rounded-xl bg-btn-primary px-6 text-sm font-bold text-btn-primary-fg"
            >
              Đăng ký gói đầu tiên →
            </Link>
          </section>
        ) : (
          <section className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">Danh sách đăng ký</p>
                <h2 className="mt-1 text-lg font-bold text-fg">{subscriptions.length} gói của bạn</h2>
              </div>
              <button
                type="button"
                onClick={() => void loadSubscriptions()}
                className="h-10 rounded-xl border border-theme bg-badge px-4 text-xs font-semibold text-fg hover:bg-ghost"
              >
                Làm mới
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription._id}
                  subscription={subscription}
                  onCancel={handleCancel}
                  onReportWrongSlot={setComplaintTarget}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {complaintTarget && (
        <WrongSlotComplaintDialog
          subscription={complaintTarget}
          offendingPlate={complaintPlate}
          description={complaintDescription}
          isSubmitting={isComplaintSubmitting}
          onPlateChange={setComplaintPlate}
          onDescriptionChange={setComplaintDescription}
          onCancel={() => {
            if (isComplaintSubmitting) return
            setComplaintTarget(null)
            setComplaintPlate('')
            setComplaintDescription('')
          }}
          onSubmit={handleSubmitComplaint}
        />
      )}
    </div>
  )
}

type StatBoxProps = {
  label: string
  value: number
  tone: 'emerald' | 'amber' | 'sky'
}

const statTone = {
  emerald: 'text-emerald-600 dark:text-emerald-300',
  amber: 'text-amber-600 dark:text-amber-300',
  sky: 'text-sky-600 dark:text-sky-300',
}

function StatBox({ label, value, tone }: StatBoxProps) {
  return (
    <div className="bg-page p-4 text-center">
      <p className={`text-3xl font-black ${statTone[tone]}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-subtle">{label}</p>
    </div>
  )
}

type SubscriptionCardProps = {
  subscription: Subscription
  onCancel: (subscription: Subscription) => void
  onReportWrongSlot: (subscription: Subscription) => void
}

function SubscriptionCard({ subscription, onCancel, onReportWrongSlot }: SubscriptionCardProps) {
  const floorLabel = subscription.slotId?.floorId?.floorNumber
    ? `Tầng ${subscription.slotId.floorId.floorNumber}`
    : subscription.vehicleType === 'motorcycle'
      ? 'Khu xe máy cư dân'
      : '-'

  return (
    <article className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="flex items-start justify-between gap-3 border-b border-theme bg-gradient-to-r from-sky-500/10 to-transparent p-5">
        <div>
          <p className="text-2xl font-black tracking-[0.08em] text-fg">{subscription.licensePlate}</p>
          <p className="mt-1 text-xs font-medium text-muted">{VEHICLE_LABELS[subscription.vehicleType]}</p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${SUBSCRIPTION_STATUS_TONE[subscription.status]}`}>
          {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
        </span>
      </div>

      <div className="grid gap-px bg-[color:var(--border)] sm:grid-cols-2">
        <CardDetail label="Gói đăng ký" value={subscription.planId?.name ?? '-'} hint={`${subscription.planId?.durationDays ?? '-'} ngày`} />
        <CardDetail label="Vị trí đỗ" value={subscription.slotId?.slotCode ?? 'Sức chứa chung'} hint={floorLabel} />
        <CardDetail label="Ngày bắt đầu" value={formatSubscriptionDate(subscription.startDate)} />
        <CardDetail label="Ngày kết thúc" value={formatSubscriptionDate(subscription.endDate)} />
      </div>

      {subscription.status === 'active' && (
        <div className="border-t border-theme p-4">
          <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-center">
            <div className="grid gap-3">
              <SubscriptionCredentialQr subscription={subscription} compact />
              {subscription.slotId?._id && (
                <button
                  type="button"
                  onClick={() => onReportWrongSlot(subscription)}
                  className="h-10 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-500/15 dark:text-rose-200"
                >
                  Báo xe đậu sai chỗ
                </button>
              )}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Thẻ cư dân QR</p>
              <p className="mt-2 text-sm text-muted">
                Dùng QR này để chứng minh xe thuộc cư dân đã đăng ký gói. Nhân viên cần đối chiếu lại trạng thái gói trên hệ thống khi quét.
              </p>
            </div>
          </div>
        </div>
      )}

      {subscription.status === 'pending' && (
        <div className="flex flex-col gap-3 border-t border-theme bg-amber-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">Đơn này chưa được thanh toán và chưa có hiệu lực.</p>
          <button
            type="button"
            onClick={() => onCancel(subscription)}
            className="h-10 rounded-xl border border-rose-500/30 px-4 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-500/10 dark:text-rose-200"
          >
            Hủy đơn chờ thanh toán
          </button>
        </div>
      )}
    </article>
  )
}

function CardDetail({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-page p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</p>
      <p className="mt-1.5 text-sm font-bold text-fg">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}

function WrongSlotComplaintDialog({
  subscription,
  offendingPlate,
  description,
  isSubmitting,
  onPlateChange,
  onDescriptionChange,
  onCancel,
  onSubmit,
}: {
  subscription: Subscription
  offendingPlate: string
  description: string
  isSubmitting: boolean
  onPlateChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onCancel: () => void
  onSubmit: () => void
}) {
  const canSubmit = Boolean(offendingPlate.trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-theme bg-page shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-theme bg-gradient-to-r from-rose-500/20 to-transparent p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
            Khiếu nại chỗ đỗ
          </p>
          <h3 className="mt-2 text-xl font-black text-fg">Báo xe đậu sai chỗ</h3>
          <p className="mt-1 text-sm text-muted">
            Chỗ của bạn: <b>{subscription.slotId?.slotCode ?? '-'}</b> · Biển số gói:{' '}
            <b>{subscription.licensePlate}</b>
          </p>
        </div>

        <div className="grid gap-4 p-5">
          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Biển số xe đang chiếm chỗ
            </span>
            <input
              value={offendingPlate}
              onChange={(event) => onPlateChange(event.target.value)}
              placeholder="VD: 61K-424.94"
              className="auth-input h-12 rounded-xl border px-4 text-base font-bold uppercase tracking-[0.08em] text-fg"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">
              Ghi chú thêm
            </span>
            <textarea
              value={description}
              onChange={(event) => onDescriptionChange(event.target.value)}
              rows={4}
              placeholder="VD: Xe đang đậu chắn đúng ô của tôi từ sáng nay."
              className="auth-input min-h-28 rounded-xl border px-4 py-3 text-sm text-fg"
            />
          </label>
        </div>

        <div className="grid gap-3 border-t border-theme p-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 rounded-xl border border-theme bg-badge px-4 text-sm font-bold text-fg hover:bg-ghost disabled:opacity-60"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !canSubmit}
            className="h-12 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-600/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi khiếu nại'}
          </button>
        </div>
      </div>
    </div>
  )
}

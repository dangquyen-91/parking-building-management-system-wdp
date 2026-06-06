import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ResidentSubscriptionTopNav } from '../components/subscription/ResidentSubscriptionTopNav'
import { userSubscriptionApi, type Subscription } from '../services/userSubscriptionApi'
import {
  formatSubscriptionDate,
  SUBSCRIPTION_STATUS_LABELS,
  SUBSCRIPTION_STATUS_TONE,
  VEHICLE_LABELS,
} from '../utils/subscriptionUi'

export function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    void loadSubscriptions()
  }, [])

  const stats = useMemo(() => {
    return {
      active: subscriptions.filter((item) => item.status === 'active').length,
      pending: subscriptions.filter((item) => item.status === 'pending').length,
      total: subscriptions.length,
    }
  }, [subscriptions])

  async function loadSubscriptions() {
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
  }

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

  return (
    <div className="min-h-screen bg-page text-fg">
      <ResidentSubscriptionTopNav activeItem="my-subscriptions" />

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl px-4 pb-4 pt-24 md:px-8 md:pb-8 lg:px-10 lg:pb-10">
        <div className="mb-6 rounded-lg border border-theme bg-badge p-5 md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // Gói của tôi</p>
              <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Gói cư dân của tôi</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted">
                Theo dõi gói đang hiệu lực, đơn chờ thanh toán và vị trí gửi xe cư dân của bạn.
              </p>
            </div>

            <div className="grid gap-2 text-center sm:min-w-96 sm:grid-cols-3">
              <StatBox label="Đang hiệu lực" value={stats.active} />
              <StatBox label="Chờ thanh toán" value={stats.pending} />
              <StatBox label="Tổng gói" value={stats.total} />
            </div>
          </div>
        </div>

        {message && <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-fg">{message}</div>}
        {error && (
          <div className="mb-5 rounded-lg border border-theme bg-badge p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        <div className="mb-5 flex justify-end">
          <Link
            to="/subscriptions"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            Mua gói mới
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Đang tải danh sách gói...</div>
        ) : subscriptions.length === 0 ? (
          <section className="liquid-glass-card rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-fg">Chưa có gói cư dân</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Bạn có thể mua gói cư dân để biển số được nhận diện tại cổng.
            </p>
            <Link
              to="/subscriptions"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg"
            >
              Mua gói cư dân
            </Link>
          </section>
        ) : (
          <section className="liquid-glass-card rounded-lg p-4 md:p-5">
            <div className="hidden grid-cols-[1fr_0.9fr_1fr_1fr_0.8fr] gap-4 border-b border-theme px-3 pb-3 text-xs font-medium uppercase tracking-[0.14em] text-subtle lg:grid">
              <span>Biển số</span>
              <span>Gói</span>
              <span>Hiệu lực</span>
              <span>Vị trí</span>
              <span>Trạng thái</span>
            </div>

            <div className="divide-y divide-[color:var(--border)]">
              {subscriptions.map((subscription) => (
                <article
                  key={subscription._id}
                  className="grid gap-4 px-3 py-4 lg:grid-cols-[1fr_0.9fr_1fr_1fr_0.8fr] lg:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-fg">{subscription.licensePlate}</p>
                    <p className="mt-1 text-xs text-subtle">{VEHICLE_LABELS[subscription.vehicleType]}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-fg">{subscription.planId?.name ?? '-'}</p>
                    <p className="mt-1 text-xs text-subtle">{subscription.planId?.durationDays ?? '-'} ngày</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-fg">{formatSubscriptionDate(subscription.startDate)}</p>
                    <p className="mt-1 text-xs text-subtle">đến {formatSubscriptionDate(subscription.endDate)}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-fg">
                      {subscription.slotId?.slotCode ?? 'Sức chứa chung'}
                    </p>
                    <p className="mt-1 text-xs text-subtle">
                      {subscription.slotId?.floorId?.floorNumber
                        ? `Tầng ${subscription.slotId.floorId.floorNumber}`
                        : subscription.vehicleType === 'motorcycle'
                          ? 'Xe máy cư dân'
                          : '-'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${SUBSCRIPTION_STATUS_TONE[subscription.status]}`}>
                      {SUBSCRIPTION_STATUS_LABELS[subscription.status]}
                    </span>
                    {subscription.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleCancel(subscription)}
                        className="rounded-full border border-theme px-3 py-1 text-xs font-semibold text-muted transition-colors hover:bg-ghost hover:text-fg"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

type StatBoxProps = {
  label: string
  value: number
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-lg border border-theme bg-page/70 px-3 py-2">
      <p className="text-lg font-semibold text-fg">{value}</p>
      <p className="text-[11px] text-subtle">{label}</p>
    </div>
  )
}
